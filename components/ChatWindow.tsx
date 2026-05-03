"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  bumpRoomActivity,
  touchRoomRead,
  markDmIncomingAsRead,
} from "@/lib/chatRoom";
import { uploadToCloudinary } from "@/lib/cloudinaryClient";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import {
  Send,
  Check,
  CheckCheck,
  Paperclip,
  X,
  Download,
  Search as SearchIcon,
  ChevronUp,
  ChevronDown,
  Info,
  LogOut,
  UserPlus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

interface Message {
  id?: string;
  text?: string;
  senderId: string;
  timestamp?: Timestamp | null;
  read: boolean;
  readAt?: Timestamp | null;
  type?: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  reactions?: Record<string, string>;
}

interface ChatWindowProps {
  selectedChat: {
    uid: string;
    id?: string;
    email?: string;
    displayName?: string;
    name?: string;
    type?: string;
    participants?: string[];
    createdBy?: string;
  };
}

export default function ChatWindow({ selectedChat }: ChatWindowProps) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [allUsers, setAllUsers] = useState<
    { uid: string; email: string; displayName?: string }[]
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGroup = selectedChat.type === "group";
  const roomId = (
    isGroup ? selectedChat.id : [currentUser!.uid, selectedChat.uid].sort().join("_")
  ) as string;

  const { sendMessage, sendTyping } = useSocket(roomId);

  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const loadMessages = async () => {
    const qBase = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(qBase);
    if (snapshot.empty) return;

    const newMsgs = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Message))
      .reverse();

    setMessages(newMsgs);
    setTimeout(() => scrollToBottom("auto"), 100);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset list when room changes
    setMessages([]);
    void loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial fetch only when roomId changes
  }, [roomId]);

  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const msg = { id: change.doc.id, ...change.doc.data() } as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (msg.senderId !== currentUser!.uid) {
            scrollToBottom();
          }
        }
        if (change.type === "modified") {
          const msg = { id: change.doc.id, ...change.doc.data() } as Message;
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
        }
      });
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- room channel only
  }, [roomId]);

  const lastMessageId = messages.length > 0 ? messages[messages.length - 1]?.id : null;

  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid || !roomId) return;
    void (async () => {
      await touchRoomRead(roomId, uid);
      if (!isGroup) await markDmIncomingAsRead(roomId, uid);
    })();
  }, [roomId, currentUser?.uid, isGroup, lastMessageId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (!term) {
      setSearchResults([]);
      setSearchIndex(-1);
      return;
    }
    const results: number[] = [];
    messages.forEach((msg, idx) => {
      const hay = [msg.text, msg.fileName].filter(Boolean).join(" ").toLowerCase();
      if (hay.includes(term)) {
        results.push(idx);
      }
    });
    setSearchResults(results);
    setSearchIndex(results.length > 0 ? results.length - 1 : -1);
  };

  const navigateSearch = (dir: "up" | "down") => {
    if (searchResults.length === 0) return;
    let newIndex = dir === "up" ? searchIndex - 1 : searchIndex + 1;
    if (newIndex < 0) newIndex = searchResults.length - 1;
    if (newIndex >= searchResults.length) newIndex = 0;
    setSearchIndex(newIndex);

    const msgElement = document.getElementById(
      `msg-${messages[searchResults[newIndex]].id}`
    );
    msgElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const inputEl = e.target;
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB.");
      return;
    }

    const type = file.type.startsWith("image/") ? "image" : "file";
    const fileSize = (file.size / 1024).toFixed(1) + " KB";
    setUploadProgress(0);

    try {
      const downloadURL = await uploadToCloudinary(
        file,
        { purpose: "room", roomId },
        (pct) => setUploadProgress(pct)
      );

      const messageData = {
        type,
        text: "",
        fileUrl: downloadURL,
        fileName: file.name,
        fileSize,
        senderId: currentUser!.uid,
        timestamp: serverTimestamp(),
        read: false,
      };
      const docRef = await addDoc(
        collection(db, "rooms", roomId, "messages"),
        messageData
      );
      const preview =
        type === "image" ? `Photo: ${file.name}` : `File: ${file.name}`;
      await bumpRoomActivity(roomId, currentUser!.uid, preview);
      sendMessage({
        ...messageData,
        id: docRef.id,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "Upload failed. Check Cloudinary env vars and that signing is enabled for your account."
      );
    } finally {
      setUploadProgress(null);
      inputEl.value = "";
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    const msgRef = doc(db, "rooms", roomId, "messages", messageId);
    const msgDoc = await getDoc(msgRef);
    const currentReactions = msgDoc.data()?.reactions || {};

    if (currentReactions[currentUser!.uid] === emoji) {
      delete currentReactions[currentUser!.uid];
    } else {
      currentReactions[currentUser!.uid] = emoji;
    }

    await updateDoc(msgRef, { reactions: currentReactions });
  };

  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={i} className="bg-identity/30 text-foreground px-0.5 font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    sendTyping(currentUser!.uid, true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageData = {
      text: inputText,
      senderId: currentUser!.uid,
      timestamp: serverTimestamp(),
      read: false,
      type: "text",
    };

    setInputText("");
    sendTyping(currentUser!.uid, false);

    try {
      const docRef = await addDoc(
        collection(db, "rooms", roomId, "messages"),
        messageData
      );
      await bumpRoomActivity(roomId, currentUser!.uid, inputText.trim());
      sendMessage({
        ...messageData,
        id: docRef.id,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleLeaveGroup = async () => {
    if (!isGroup) return;
    const roomRef = doc(db, "rooms", roomId);
    const newParticipants = (selectedChat.participants ?? []).filter(
      (id: string) => id !== currentUser!.uid
    );
    if (newParticipants.length === 0) {
      await updateDoc(roomRef, { type: "deleted" });
    } else {
      await updateDoc(roomRef, { participants: newParticipants });
    }
    window.location.reload();
  };

  const handleRemoveParticipant = async (userId: string) => {
    if (!isGroup || selectedChat.createdBy !== currentUser!.uid) return;
    const roomRef = doc(db, "rooms", roomId);
    const newParticipants = (selectedChat.participants ?? []).filter(
      (id: string) => id !== userId
    );
    await updateDoc(roomRef, { participants: newParticipants });
  };

  const handleAddParticipant = async (userId: string) => {
    if (!isGroup || selectedChat.createdBy !== currentUser!.uid) return;
    if ((selectedChat.participants ?? []).includes(userId)) return;
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      participants: [...(selectedChat.participants ?? []), userId],
    });
  };

  useEffect(() => {
    if (showGroupInfo) {
      const q = query(collection(db, "users"));
      getDocs(q).then((snap) => {
        setAllUsers(
          snap.docs.map((d) => d.data() as { uid: string; email: string; displayName?: string })
        );
      });
    }
  }, [showGroupInfo]);

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface sticky top-0 z-10">
        <div className="flex items-center min-w-0">
          <div
            className={`w-10 h-10 shrink-0 border border-border flex items-center justify-center mr-3 font-black text-sm ${isGroup ? "bg-secondary/40 text-secondary-fg" : "bg-identity text-identity-fg"
              }`}
          >
            {isGroup
              ? (selectedChat.name?.[0] ?? "?").toUpperCase()
              : (selectedChat.email?.[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black truncate max-w-[200px] text-foreground">
              {isGroup
                ? selectedChat.name ?? "Group"
                : selectedChat.displayName || selectedChat.email || "Chat"}
            </h2>
            {isGroup && (
              <p className="text-xs text-muted font-medium">
                {selectedChat.participants?.length ?? 0} participants
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {showSearch && (
            <div className="flex items-center bg-input border border-border px-2 py-1 animate-fade-in focus-within:border-identity">
              <input
                type="text"
                autoFocus
                placeholder="Search…"
                value={searchTerm}
                onChange={handleSearch}
                className="bg-transparent border-none outline-none text-xs text-foreground w-32 md:w-48 placeholder:text-muted focus:ring-0"
              />
              <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
                <button
                  type="button"
                  onClick={() => navigateSearch("up")}
                  className="text-muted hover:text-foreground p-0.5"
                >
                  <ChevronUp size={14} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => navigateSearch("down")}
                  className="text-muted hover:text-foreground p-0.5"
                >
                  <ChevronDown size={14} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchTerm("");
                  }}
                  className="text-muted hover:text-foreground ml-1 p-0.5"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-muted hover:text-identity hover:bg-secondary/15 transition-colors"
          >
            <SearchIcon size={20} strokeWidth={2.5} />
          </button>

          {isGroup && (
            <button
              type="button"
              onClick={() => setShowGroupInfo(true)}
              className="p-2 text-muted hover:text-identity hover:bg-secondary/15 transition-colors"
            >
              <Info size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {showGroupInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4">
          <div className="bg-surface w-full max-w-md border border-border overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-border flex items-center justify-between bg-identity/5">
              <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                Group
              </h3>
              <button
                type="button"
                onClick={() => setShowGroupInfo(false)}
                className="text-muted hover:text-foreground hover:bg-secondary/15 p-1"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">
                  Members
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {allUsers
                    .filter((u) => (selectedChat.participants ?? []).includes(u.uid))
                    .map((u) => (
                      <div key={u.uid} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-secondary/35 border border-border shrink-0 flex items-center justify-center text-xs font-black text-secondary-fg">
                            {u.displayName?.[0] || u.email[0]}
                          </div>
                          <span className="text-sm text-foreground truncate">
                            {u.displayName || u.email}{" "}
                            {u.uid === selectedChat.createdBy && (
                              <span className="text-[10px] font-black uppercase bg-identity text-identity-fg px-1 py-0 border border-border ml-1 inline-block align-middle">
                                Admin
                              </span>
                            )}
                          </span>
                        </div>
                        {selectedChat.createdBy === currentUser!.uid &&
                          u.uid !== currentUser!.uid && (
                            <button
                              type="button"
                              onClick={() => handleRemoveParticipant(u.uid)}
                              className="text-danger hover:opacity-80 p-1 shrink-0"
                            >
                              <Trash2 size={18} strokeWidth={2.5} />
                            </button>
                          )}
                      </div>
                    ))}
                </div>
              </div>

              {selectedChat.createdBy === currentUser!.uid && (
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">
                    Add people
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {allUsers
                      .filter((u) => !(selectedChat.participants ?? []).includes(u.uid))
                      .map((u) => (
                        <div
                          key={u.uid}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-sm text-foreground truncate">
                            {u.displayName || u.email}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddParticipant(u.uid)}
                            className="text-identity hover:opacity-80 p-1 shrink-0 hover:bg-secondary/15"
                          >
                            <UserPlus size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleLeaveGroup}
                  className="w-full py-3 bg-[var(--danger-muted)] border border-danger text-danger flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-opacity"
                >
                  <LogOut size={18} strokeWidth={2.5} /> Leave group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser!.uid;
          const time = msg.timestamp?.toDate
            ? format(msg.timestamp.toDate(), "HH:mm")
            : "";
          const isHighlighted = searchResults[searchIndex] === idx;

          return (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="group relative flex items-center gap-2 max-w-[85%] md:max-w-[70%]">
                <div
                  className={`absolute -top-12 ${isMe ? "right-0" : "left-0"} hidden group-hover:flex items-end pb-4 z-20`}
                >
                  <div className="flex items-center gap-0.5 bg-surface border border-border p-1.5 shadow-sm shadow-identity/10">
                    {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => addReaction(msg.id!, emoji)}
                        className="px-1 hover:opacity-70"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`px-4 py-2 transition-all ${isHighlighted
                      ? "ring-2 ring-identity ring-offset-2 ring-offset-background"
                      : ""
                    } ${isMe
                      ? "bg-bubble-me text-bubble-me-fg"
                      : "bg-bubble-other text-bubble-other-fg"
                    }`}
                >
                  {msg.type === "image" ? (
                    <div className="space-y-2">
                      <img
                        src={msg.fileUrl}
                        alt=""
                        className="max-w-[200px] max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity border border-border"
                        onClick={() => window.open(msg.fileUrl, "_blank")}
                      />
                      <p className="text-xs opacity-80 italic">{msg.fileName}</p>
                    </div>
                  ) : msg.type === "file" ? (
                    <div className="flex items-center gap-3 p-2 bg-input/50 border border-border">
                      <div className="p-2 bg-secondary/25 border border-border">
                        <Download size={20} strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate max-w-[150px]">
                          {msg.fileName}
                        </p>
                        <p className="text-[10px] text-muted">{msg.fileSize}</p>
                      </div>
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={msg.fileName}
                        className="p-2 text-foreground hover:opacity-70"
                      >
                        <Download size={18} strokeWidth={2.5} />
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      {highlightText(msg.text ?? "")}
                    </p>
                  )}

                  <div
                    className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-bubble-me-fg/80" : "text-bubble-other-fg/70"
                      }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide">
                      {time}
                    </span>
                    {isMe && !isGroup && (
                      <span className="opacity-80" title={msg.read ? "Seen" : "Delivered"}>
                        {msg.read ? (
                          <CheckCheck size={14} strokeWidth={2.5} className="text-identity" />
                        ) : (
                          <Check size={14} strokeWidth={2.5} />
                        )}
                      </span>
                    )}
                    {isMe && isGroup && (
                      <span className="opacity-80" title="Sent">
                        <Check size={14} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                  {isMe && !isGroup && msg.read && msg.readAt?.toDate && (
                    <p className="text-[9px] opacity-70 text-right mt-1 font-medium uppercase tracking-wide">
                      Seen {format(msg.readAt.toDate(), "MMM d · HH:mm")}
                    </p>
                  )}
                </div>
              </div>

              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div
                  className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {Object.entries(
                    Object.values(msg.reactions ?? {}).reduce(
                      (acc: Record<string, number>, val: string) => {
                        acc[val] = (acc[val] || 0) + 1;
                        return acc;
                      },
                      {}
                    )
                  ).map(([emoji, count]: [string, number]) => (
                    <div
                      key={emoji}
                      className="flex items-center gap-1 bg-secondary/20 border border-border px-1.5 py-0.5 text-xs"
                    >
                      <span>{emoji}</span>
                      <span className="text-muted font-black">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {uploadProgress !== null && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 bg-surface border border-border p-4 z-30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-foreground">
              Uploading
            </span>
            <span className="text-xs font-bold text-foreground">
              {Math.round(uploadProgress)}%
            </span>
          </div>
          <div className="h-2 bg-[var(--progress-track)] overflow-hidden border border-border">
            <div
              className="h-full bg-identity transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="p-4 bg-surface border-t border-border">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 bg-secondary/25 border border-border text-foreground flex items-center justify-center shrink-0 hover:bg-secondary/35 transition-colors"
          >
            <Paperclip size={20} strokeWidth={2.5} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Message…"
              className="w-full bg-input border border-border px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-identity resize-none max-h-32"
            />
          </div>

          <button
            type="submit"
            className="w-12 h-12 bg-identity text-identity-fg border border-border flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
