"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Search } from "lucide-react";

interface UserData {
  uid: string;
  email: string;
  status: string;
}

interface UserSidebarProps {
  onSelectUser: (user: UserData) => void;
  selectedUserId?: string;
}

export default function UserSidebar({ onSelectUser, selectedUserId }: UserSidebarProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Listen for all users except current user
    const q = query(collection(db, "users"), where("uid", "!=", currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData: UserData[] = [];
      snapshot.forEach((doc) => {
        userData.push(doc.data() as UserData);
      });
      setUsers(userData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 h-full bg-slate-900 border-r border-slate-700 flex flex-col overflow-hidden">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 pb-4 space-y-1">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-slate-500 text-sm mt-8">No users found</p>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.uid}
                onClick={() => onSelectUser(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedUserId === user.uid
                    ? "bg-blue-600/20 text-blue-100 border-blue-500/50 border"
                    : "hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-lg font-semibold text-slate-300">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-slate-900 rounded-full ${
                      user.status === "online" ? "bg-green-500" : "bg-slate-500"
                    }`}
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.status}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
