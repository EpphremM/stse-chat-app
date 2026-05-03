"use client";

import { useEffect, useRef, useState } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  where,
  writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { Send, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id?: string;
  text: string;
  senderId: string;
  timestamp: any;
  read: boolean;
}

interface ChatWindowProps {
  selectedUser: { uid: string; email: string };
}

export default function ChatWindow({ selectedUser }: ChatWindowProps) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate unique room ID
  const roomId = [currentUser!.uid, selectedUser.uid].sort().join("_");
  
  const { sendMessage, sendTyping, onMessage, onTyping } = useSocket(roomId);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator timeout
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    sendTyping(currentUser!.uid, true);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(currentUser!.uid, false);
    }, 2000);
  };

  // Mark all unread messages as read when opening chat
  useEffect(() => {
    const markAsRead = async () => {
      const q = query(
        collection(db, "rooms", roomId, "messages"),
        where("senderId", "==", selectedUser.uid),
        where("read", "==", false)
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      snapshot.forEach((msgDoc) => {
        batch.update(doc(db, "rooms", roomId, "messages", msgDoc.id), { read: true });
      });
      
      await batch.commit();
    };

    markAsRead();
  }, [roomId, selectedUser.uid]);

  // Listen for messages from Firestore (Persistence)
  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [roomId]);

  // Listen for real-time messages and typing from Socket
  useEffect(() => {
    const cleanupMessage = onMessage((data) => {
      // Message received via socket
      // We don't strictly need to update state here because Firestore onSnapshot will handle it,
      // but for "instant" feeling we could. However, Firestore is usually fast enough.
      console.log("Socket message received:", data);
    });

    const cleanupTyping = onTyping((data) => {
      if (data.userId === selectedUser.uid) {
        setIsOtherTyping(data.isTyping);
      }
    });

    return () => {
      cleanupMessage();
      cleanupTyping();
    };
  }, [onMessage, onTyping, selectedUser.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageData = {
      text: inputText,
      senderId: currentUser!.uid,
      timestamp: serverTimestamp(),
      read: false,
    };

    setInputText("");
    sendTyping(currentUser!.uid, false);

    try {
      // 1. Save to Firestore
      const docRef = await addDoc(collection(db, "rooms", roomId, "messages"), messageData);
      
      // 2. Emit via Socket
      sendMessage({
        ...messageData,
        id: docRef.id,
        timestamp: new Date().toISOString(), // Use ISO string for socket delivery
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
      {/* Chat Header */}
      <div className="h-16 border-b border-slate-700 flex items-center px-6 bg-slate-800/50 backdrop-blur-md sticky top-0 z-10">
        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center mr-3 text-white font-semibold">
          {selectedUser.email[0].toUpperCase()}
        </div>
        <div>
          <h2 className="text-white font-medium">{selectedUser.email}</h2>
          {isOtherTyping && (
            <p className="text-xs text-blue-400 animate-pulse">is typing...</p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser!.uid;
          const time = msg.timestamp?.toDate ? format(msg.timestamp.toDate(), "HH:mm") : "";

          return (
            <div
              key={msg.id || Math.random()}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm relative group ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-800 text-slate-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-blue-100" : "text-slate-500"}`}>
                  <span className="text-[10px] opacity-70">
                    {time}
                  </span>
                  {isMe && (
                    <span className="opacity-70">
                      {msg.read ? (
                        <CheckCheck size={14} className="text-blue-200" />
                      ) : (
                        <Check size={14} />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-800/50 border-t border-slate-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
