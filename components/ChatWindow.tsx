"use client";

<<<<<<< HEAD
import { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
=======
import { useEffect, useRef, useState, useMemo } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  startAfter,
  onSnapshot, 
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
<<<<<<< HEAD
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
=======
  where,
  writeBatch,
  getDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { 
  Send, Check, CheckCheck, Paperclip, X, Download, 
  Search as SearchIcon, ChevronUp, ChevronDown, Smile, Plus,
  Info, MoreVertical, LogOut, UserPlus, Trash2
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
} from "lucide-react";
import { format } from "date-fns";

interface Message {
  id?: string;
<<<<<<< HEAD
  text?: string;
  senderId: string;
  timestamp?: Timestamp | null;
  read: boolean;
  readAt?: Timestamp | null;
=======
  text: string;
  senderId: string;
  timestamp: any;
  read: boolean;
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
  type?: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
<<<<<<< HEAD
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
=======
  reactions?: { [userId: string]: string };
}

interface ChatWindowProps {
  selectedChat: any; // Can be User or Group
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
}

export default function ChatWindow({ selectedChat }: ChatWindowProps) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
<<<<<<< HEAD
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
=======
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Search state
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
<<<<<<< HEAD
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

=======
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isGroup = selectedChat.type === "group";
  const roomId = isGroup ? selectedChat.id : [currentUser!.uid, selectedChat.uid].sort().join("_");
  
  const { sendMessage, sendTyping, onMessage, onTyping } = useSocket(roomId);

  // Auto-scroll to bottom only on new message if user is already at bottom
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

<<<<<<< HEAD
  const loadMessages = async () => {
    const qBase = query(
=======
  // Pagination: Load messages
  useEffect(() => {
    setMessages([]);
    setLastVisible(null);
    setHasMore(true);
    loadMessages();
  }, [roomId]);

  const loadMessages = async (isLoadMore = false) => {
    let q = query(
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

<<<<<<< HEAD
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

=======
    if (isLoadMore && lastVisible) {
      q = query(
        collection(db, "rooms", roomId, "messages"),
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(50)
      );
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      if (isLoadMore) setHasMore(false);
      return;
    }

    const newMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)).reverse();
    
    if (isLoadMore) {
      setMessages(prev => [...newMsgs, ...prev]);
    } else {
      setMessages(newMsgs);
      setTimeout(() => scrollToBottom("auto"), 100);
    }
    
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    if (snapshot.docs.length < 50) setHasMore(false);
  };

  // Real-time listener for recent messages (handles edits/reactions)
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
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
<<<<<<< HEAD
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
=======
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
            return [...prev, msg];
          });
          if (msg.senderId !== currentUser!.uid) {
            scrollToBottom();
          }
        }
        if (change.type === "modified") {
          const msg = { id: change.doc.id, ...change.doc.data() } as Message;
<<<<<<< HEAD
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
=======
          setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
        }
      });
    });

    return () => unsubscribe();
<<<<<<< HEAD
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

=======
  }, [roomId]);

  // Search logic
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
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
<<<<<<< HEAD
      const hay = [msg.text, msg.fileName].filter(Boolean).join(" ").toLowerCase();
      if (hay.includes(term)) {
=======
      if (msg.text?.toLowerCase().includes(term)) {
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
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
<<<<<<< HEAD

    const msgElement = document.getElementById(
      `msg-${messages[searchResults[newIndex]].id}`
    );
    msgElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const inputEl = e.target;
=======
    
    const msgElement = document.getElementById(`msg-${messages[searchResults[newIndex]].id}`);
    msgElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB.");
      return;
    }

    const type = file.type.startsWith("image/") ? "image" : "file";
<<<<<<< HEAD
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
=======
    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(1) + " KB";
    const storageRef = ref(storage, `rooms/${roomId}/${Date.now()}_${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed", 
      (snapshot) => {
        const progress = snapshot.totalBytes > 0 ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 : 0;
        setUploadProgress(progress);
      },
      (error) => { console.error("Upload error:", error); alert("Upload failed: " + error.message); setUploadProgress(null); },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const messageData = {
          type,
          fileUrl: downloadURL,
          fileName,
          fileSize,
          senderId: currentUser!.uid,
          timestamp: serverTimestamp(),
          read: false,
        };
        const docRef = await addDoc(collection(db, "rooms", roomId, "messages"), messageData);
        sendMessage({
          ...messageData,
          id: docRef.id,
          timestamp: new Date().toISOString(),
        });
        setUploadProgress(null);
      }
    );
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
  };

  const addReaction = async (messageId: string, emoji: string) => {
    const msgRef = doc(db, "rooms", roomId, "messages", messageId);
    const msgDoc = await getDoc(msgRef);
    const currentReactions = msgDoc.data()?.reactions || {};
<<<<<<< HEAD

=======
    
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    if (currentReactions[currentUser!.uid] === emoji) {
      delete currentReactions[currentUser!.uid];
    } else {
      currentReactions[currentUser!.uid] = emoji;
    }
<<<<<<< HEAD

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
=======
    
    await updateDoc(msgRef, { reactions: currentReactions });
  };

  // Render helpers
  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <mark key={i} className="bg-yellow-400 text-black rounded-sm px-0.5">{part}</mark> : part
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTyping(currentUser!.uid, true);
    // ... typing timeout logic same as before
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
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
<<<<<<< HEAD
      const docRef = await addDoc(
        collection(db, "rooms", roomId, "messages"),
        messageData
      );
      await bumpRoomActivity(roomId, currentUser!.uid, inputText.trim());
=======
      const docRef = await addDoc(collection(db, "rooms", roomId, "messages"), messageData);
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
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
<<<<<<< HEAD
    const newParticipants = (selectedChat.participants ?? []).filter(
      (id: string) => id !== currentUser!.uid
    );
    if (newParticipants.length === 0) {
      await updateDoc(roomRef, { type: "deleted" });
=======
    const newParticipants = selectedChat.participants.filter((id: string) => id !== currentUser!.uid);
    if (newParticipants.length === 0) {
      await updateDoc(roomRef, { type: "deleted" }); // Or actually delete
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    } else {
      await updateDoc(roomRef, { participants: newParticipants });
    }
    window.location.reload();
  };

  const handleRemoveParticipant = async (userId: string) => {
    if (!isGroup || selectedChat.createdBy !== currentUser!.uid) return;
    const roomRef = doc(db, "rooms", roomId);
<<<<<<< HEAD
    const newParticipants = (selectedChat.participants ?? []).filter(
      (id: string) => id !== userId
    );
=======
    const newParticipants = selectedChat.participants.filter((id: string) => id !== userId);
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    await updateDoc(roomRef, { participants: newParticipants });
  };

  const handleAddParticipant = async (userId: string) => {
    if (!isGroup || selectedChat.createdBy !== currentUser!.uid) return;
<<<<<<< HEAD
    if ((selectedChat.participants ?? []).includes(userId)) return;
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      participants: [...(selectedChat.participants ?? []), userId],
=======
    if (selectedChat.participants.includes(userId)) return;
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { 
      participants: [...selectedChat.participants, userId] 
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    });
  };

  useEffect(() => {
    if (showGroupInfo) {
      const q = query(collection(db, "users"));
<<<<<<< HEAD
      getDocs(q).then((snap) => {
        setAllUsers(
          snap.docs.map((d) => d.data() as { uid: string; email: string; displayName?: string })
        );
=======
      getDocs(q).then(snap => {
        setAllUsers(snap.docs.map(d => d.data()));
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
      });
    }
  }, [showGroupInfo]);

  return (
<<<<<<< HEAD
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface sticky top-0 z-10">
        <div className="flex items-center min-w-0">
          <div
            className={`w-10 h-10 shrink-0 border border-border flex items-center justify-center mr-3 font-black text-sm ${
              isGroup ? "bg-secondary/40 text-secondary-fg" : "bg-identity text-identity-fg"
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
=======
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
      {/* Chat Header */}
      <div className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-800/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${isGroup ? "bg-indigo-600" : "bg-slate-700"} rounded-full flex items-center justify-center mr-3 text-white font-semibold shadow-inner`}>
            {isGroup ? selectedChat.name[0].toUpperCase() : selectedChat.email[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-white font-medium truncate max-w-[200px]">
              {isGroup ? selectedChat.name : (selectedChat.displayName || selectedChat.email)}
            </h2>
            {isOtherTyping && !isGroup && <p className="text-xs text-blue-400 animate-pulse">is typing...</p>}
            {isGroup && <p className="text-xs text-slate-400">{selectedChat.participants.length} participants</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 animate-fade-in">
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className="bg-transparent border-none outline-none text-xs text-slate-200 w-32 md:w-48"
              />
              <div className="flex items-center gap-1 ml-2 border-l border-slate-700 pl-2">
                <button onClick={() => navigateSearch("up")} className="text-slate-500 hover:text-white"><ChevronUp size={14} /></button>
                <button onClick={() => navigateSearch("down")} className="text-slate-500 hover:text-white"><ChevronDown size={14} /></button>
                <button onClick={() => { setShowSearch(false); setSearchTerm(""); }} className="text-slate-500 hover:text-white ml-1"><X size={14} /></button>
              </div>
            </div>
          )}
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 text-slate-400 hover:text-white transition-colors">
            <SearchIcon size={20} />
          </button>
          
          {isGroup && (
            <button onClick={() => setShowGroupInfo(true)} className="p-2 text-slate-400 hover:text-white transition-colors">
              <Info size={20} />
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
            </button>
          )}
        </div>
      </div>

<<<<<<< HEAD
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
=======
      {/* Group Info Modal */}
      {showGroupInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Group Details</h3>
              <button onClick={() => setShowGroupInfo(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Participants</p>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {allUsers.filter(u => selectedChat.participants.includes(u.uid)).map(u => (
                    <div key={u.uid} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {u.displayName?.[0] || u.email[0]}
                        </div>
                        <span className="text-sm text-slate-200">{u.displayName || u.email} {u.uid === selectedChat.createdBy && <span className="text-[10px] bg-blue-600 px-1 rounded ml-1">Admin</span>}</span>
                      </div>
                      {selectedChat.createdBy === currentUser!.uid && u.uid !== currentUser!.uid && (
                        <button onClick={() => handleRemoveParticipant(u.uid)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={16} /></button>
                      )}
                    </div>
                  ))}
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
                </div>
              </div>

              {selectedChat.createdBy === currentUser!.uid && (
                <div>
<<<<<<< HEAD
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
=======
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Add Participant</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {allUsers.filter(u => !selectedChat.participants.includes(u.uid)).map(u => (
                      <div key={u.uid} className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">{u.displayName || u.email}</span>
                        <button onClick={() => handleAddParticipant(u.uid)} className="text-blue-500 hover:text-blue-400 p-1"><UserPlus size={16} /></button>
                      </div>
                    ))}
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
                  </div>
                </div>
              )}

<<<<<<< HEAD
              <div className="pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleLeaveGroup}
                  className="w-full py-3 bg-[var(--danger-muted)] border border-danger text-danger flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-opacity"
                >
                  <LogOut size={18} strokeWidth={2.5} /> Leave group
=======
              <div className="pt-4 border-t border-slate-700 flex gap-3">
                <button 
                  onClick={handleLeaveGroup}
                  className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                >
                  <LogOut size={18} /> Leave Group
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

<<<<<<< HEAD
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser!.uid;
          const time = msg.timestamp?.toDate
            ? format(msg.timestamp.toDate(), "HH:mm")
            : "";
=======
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {hasMore && (
          <button 
            onClick={() => loadMessages(true)}
            className="w-full py-2 text-xs font-bold text-slate-500 hover:text-blue-400 transition-colors"
          >
            Load Older Messages
          </button>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser!.uid;
          const time = msg.timestamp?.toDate ? format(msg.timestamp.toDate(), "HH:mm") : "";
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
          const isHighlighted = searchResults[searchIndex] === idx;

          return (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="group relative flex items-center gap-2 max-w-[85%] md:max-w-[70%]">
<<<<<<< HEAD
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
=======
                {/* Reaction Picker (Hover) */}
                <div className={`absolute -top-12 ${isMe ? "right-0" : "left-0"} hidden group-hover:flex items-end pb-4 z-20`}>
                  <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 p-1.5 rounded-full shadow-2xl">
                    {["👍", "❤️", "😂", "😮", "😢"].map(emoji => (
                      <button 
                        key={emoji}
                        onClick={() => addReaction(msg.id!, emoji)}
                        className="hover:scale-125 transition-transform px-1"
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div
<<<<<<< HEAD
                  className={`px-4 py-2 transition-all ${
                    isHighlighted
                      ? "ring-2 ring-identity ring-offset-2 ring-offset-background"
                      : ""
                  } ${
                    isMe
                      ? "bg-bubble-me text-bubble-me-fg"
                      : "bg-bubble-other text-bubble-other-fg"
=======
                  className={`rounded-2xl px-4 py-2 shadow-sm transition-all ${
                    isHighlighted ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900" : ""
                  } ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 rounded-bl-none"
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
                  }`}
                >
                  {msg.type === "image" ? (
                    <div className="space-y-2">
<<<<<<< HEAD
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
                    className={`flex items-center justify-end gap-1 mt-1 ${
                      isMe ? "text-bubble-me-fg/80" : "text-bubble-other-fg/70"
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
=======
                      <img 
                        src={msg.fileUrl} 
                        alt="" 
                        className="max-w-[200px] max-h-[300px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.fileUrl, "_blank")}
                      />
                      <p className="text-xs opacity-70 italic">{msg.fileName}</p>
                    </div>
                  ) : msg.type === "file" ? (
                    <div className="flex items-center gap-3 p-2 bg-slate-900/40 rounded-xl">
                      <div className="p-2 bg-slate-700 rounded-lg"><Download size={20} /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[150px]">{msg.fileName}</p>
                        <p className="text-[10px] opacity-60">{msg.fileSize}</p>
                      </div>
                      <a href={msg.fileUrl} download className="p-2 hover:text-blue-400 transition-colors"><Download size={18} /></a>
                    </div>
                  ) : (
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      {highlightText(msg.text)}
                    </p>
                  )}
                  
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-blue-100" : "text-slate-500"}`}>
                    <span className="text-[10px] opacity-70">{time}</span>
                    {isMe && (
                      <span className="opacity-70">
                        {msg.read ? <CheckCheck size={14} className="text-blue-200" /> : <Check size={14} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reaction Display */}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                  {Object.entries(
                    Object.values(msg.reactions).reduce((acc: any, val) => {
                      acc[val] = (acc[val] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([emoji, count]: [string, any]) => (
                    <div key={emoji} className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-full text-xs">
                      <span>{emoji}</span>
                      <span className="text-slate-400 font-bold">{count}</span>
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

<<<<<<< HEAD
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
=======
      {/* Upload Progress Overlay */}
      {uploadProgress !== null && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-2xl z-30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Uploading file...</span>
            <span className="text-xs text-blue-400">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
          </div>
        </div>
      )}

<<<<<<< HEAD
      <div className="p-4 bg-surface border-t border-border">
=======
      {/* Input Area */}
      <div className="p-4 bg-slate-800/50 border-t border-slate-700">
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
<<<<<<< HEAD
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

=======
            className="w-12 h-12 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl flex items-center justify-center transition-all shrink-0"
          >
            <Paperclip size={20} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
<<<<<<< HEAD
                  handleSendMessage(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Message…"
              className="w-full bg-input border border-border px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-identity resize-none max-h-32"
=======
                  handleSendMessage(e as any);
                }
              }}
              placeholder="Type a message..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner resize-none max-h-32"
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
            />
          </div>

          <button
            type="submit"
<<<<<<< HEAD
            className="w-12 h-12 bg-identity text-identity-fg border border-border flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
          >
            <Send size={20} strokeWidth={2.5} />
=======
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 shrink-0"
          >
            <Send size={20} />
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
          </button>
        </form>
      </div>
    </div>
  );
}
