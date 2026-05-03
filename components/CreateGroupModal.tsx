"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
<<<<<<< HEAD
import { X, Users } from "lucide-react";
=======
import { X, UserPlus, Users } from "lucide-react";
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "users"), where("uid", "!=", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData: UserData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as UserData;
        if (data.uid !== currentUser.uid) {
          userData.push(data);
        }
      });
      setUsers(userData);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const toggleUser = (userId: string) => {
<<<<<<< HEAD
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
=======
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const participants = [...selectedUsers, currentUser!.uid];
      await addDoc(collection(db, "rooms"), {
        name: groupName,
        type: "group",
        participants,
        createdBy: currentUser!.uid,
        createdAt: serverTimestamp(),
        lastMessage: "",
<<<<<<< HEAD
        lastMessageTime: serverTimestamp(),
=======
        lastMessageTime: serverTimestamp()
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
      });
      onClose();
      setGroupName("");
      setSelectedUsers([]);
    } catch (err) {
      console.error("Error creating group:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
<<<<<<< HEAD
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
      <div className="bg-surface w-full max-w-md border border-border overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-border flex items-center justify-between bg-identity/5">
          <h2 className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Users className="text-foreground shrink-0" size={22} strokeWidth={2.5} /> New group
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-identity hover:bg-secondary/15 p-1"
          >
            <X size={22} strokeWidth={2.5} />
=======
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-500" /> Create New Group
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="p-6 space-y-6">
          <div>
<<<<<<< HEAD
            <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-2">
              Name
            </label>
=======
            <label className="block text-sm font-medium text-slate-300 mb-2">Group Name</label>
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
<<<<<<< HEAD
              className="w-full bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:border-identity placeholder:text-muted"
              placeholder="Team name"
=======
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Project Team 🚀"
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
              required
            />
          </div>

          <div>
<<<<<<< HEAD
            <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-2">
              People ({selectedUsers.length})
=======
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Participants ({selectedUsers.length})
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
            </label>
            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-2">
              {users.map((user) => (
                <div
                  key={user.uid}
<<<<<<< HEAD
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleUser(user.uid)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      toggleUser(user.uid);
                    }
                  }}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors border-l-2 ${
                    selectedUsers.includes(user.uid)
                      ? "bg-identity/10 border-l-identity"
                      : "hover:bg-secondary/15 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-secondary/35 border border-border flex items-center justify-center text-secondary-fg font-bold shrink-0">
                      {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 border flex items-center justify-center shrink-0 font-black text-[10px] ${
                      selectedUsers.includes(user.uid)
                        ? "bg-identity text-identity-fg border-identity"
                        : "border-border"
                    }`}
                  >
                    {selectedUsers.includes(user.uid) ? "✓" : ""}
=======
                  onClick={() => toggleUser(user.uid)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    selectedUsers.includes(user.uid)
                      ? "bg-blue-600/20 border-blue-500/50 border"
                      : "hover:bg-slate-700/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-medium">
                      {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.displayName || user.email}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedUsers.includes(user.uid)
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-slate-600"
                  }`}>
                    {selectedUsers.includes(user.uid) && <UserPlus size={14} />}
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !groupName || selectedUsers.length === 0}
<<<<<<< HEAD
            className="w-full py-3 px-4 bg-identity text-identity-fg font-black uppercase tracking-widest text-xs border border-border hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Creating…" : "Create"}
=======
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? "Creating..." : "Create Group"}
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
          </button>
        </form>
      </div>
    </div>
  );
}
