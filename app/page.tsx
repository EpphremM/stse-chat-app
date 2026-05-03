"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import UserSidebar from "@/components/UserSidebar";
import ChatWindow from "@/components/ChatWindow";
import { MessageSquare } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden">
      <Navbar />
      
      <main className="flex flex-1 overflow-hidden">
        {/* Mobile Toggle would go here */}
        <div className={`${selectedUser ? "hidden md:block" : "block"} w-full md:w-auto h-full`}>
          <UserSidebar 
            onSelectUser={(u) => setSelectedUser(u)} 
            selectedUserId={selectedUser?.uid} 
          />
        </div>

        <div className={`${!selectedUser ? "hidden md:flex" : "flex"} flex-1 h-full`}>
          {selectedUser ? (
            <ChatWindow selectedUser={selectedUser} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                <MessageSquare size={40} />
              </div>
              <h2 className="text-xl font-medium text-slate-300">No Chat Selected</h2>
              <p className="text-sm text-center max-w-xs mt-2">
                Select a user from the sidebar to start a secure, real-time conversation.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
