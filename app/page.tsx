"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import UserSidebar from "@/components/UserSidebar";
<<<<<<< HEAD
import type { ComponentProps } from "react";
import ChatWindow from "@/components/ChatWindow";
import { MessageSquare } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

type SelectedChat = ComponentProps<typeof ChatWindow>["selectedChat"];
=======
import ChatWindow from "@/components/ChatWindow";
import { MessageSquare } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
<<<<<<< HEAD
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);

=======
  const [selectedChat, setSelectedChat] = useState<any>(null);

  // Initialize notifications
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
  useNotifications(user);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
<<<<<<< HEAD
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div
          className="size-12 border-4 border-foreground border-t-transparent animate-spin"
          aria-hidden
        />
=======
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Navbar />

      <main className="flex flex-1 overflow-hidden">
        <div className={`${selectedChat ? "hidden md:block" : "block"} w-full md:w-auto h-full`}>
          <UserSidebar
            onSelectUser={(chat) => setSelectedChat(chat)}
            selectedRoomId={selectedChat?.uid || selectedChat?.id}
=======
    <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden">
      <Navbar />
      
      <main className="flex flex-1 overflow-hidden">
        <div className={`${selectedChat ? "hidden md:block" : "block"} w-full md:w-auto h-full`}>
          <UserSidebar 
            onSelectUser={(chat) => setSelectedChat(chat)} 
            selectedRoomId={selectedChat?.uid || selectedChat?.id} 
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
          />
        </div>

        <div className={`${!selectedChat ? "hidden md:flex" : "flex"} flex-1 h-full`}>
          {selectedChat ? (
            <ChatWindow key={selectedChat.uid || selectedChat.id} selectedChat={selectedChat} />
          ) : (
<<<<<<< HEAD
            <div className="flex-1 flex flex-col items-center justify-center text-muted p-8 border-l border-border">
              <div className="w-20 h-20 bg-surface border border-border flex items-center justify-center mb-6">
                <MessageSquare size={40} strokeWidth={2} />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                No chat selected
              </h2>
              <p className="text-sm text-center max-w-xs mt-3 leading-relaxed">
                Pick a contact or group in the sidebar to start a conversation.
=======
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                <MessageSquare size={40} />
              </div>
              <h2 className="text-xl font-medium text-slate-300">No Chat Selected</h2>
              <p className="text-sm text-center max-w-xs mt-2">
                Select a contact or group from the sidebar to start a secure, real-time conversation.
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
