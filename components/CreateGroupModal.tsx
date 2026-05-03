"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { X, Users } from "lucide-react";

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
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
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
        lastMessageTime: serverTimestamp(),
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
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-2">
              Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:border-identity placeholder:text-muted"
              placeholder="Team name"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-2">
              People ({selectedUsers.length})
            </label>
            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-2">
              {users.map((user) => (
                <div
                  key={user.uid}
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !groupName || selectedUsers.length === 0}
            className="w-full py-3 px-4 bg-identity text-identity-fg font-black uppercase tracking-widest text-xs border border-border hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}
