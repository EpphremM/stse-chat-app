"use client";

import { useEffect, useState } from "react";
<<<<<<< HEAD
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { directRoomId } from "@/lib/chatRoom";
import { useRoomUnread } from "@/hooks/useRoomUnread";
=======
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
import { Search, Users, Plus, User as UserIcon } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  status: string;
}

interface RoomData {
  id: string;
  name: string;
  type: "group" | "private";
  participants: string[];
}

interface UserSidebarProps {
<<<<<<< HEAD
  onSelectUser: (user: UserData | (RoomData & { uid: string })) => void;
  selectedRoomId?: string;
}

function GroupChatRow({
  group,
  currentUid,
  selectedRoomId,
  onSelect,
}: {
  group: RoomData;
  currentUid: string;
  selectedRoomId?: string;
  onSelect: () => void;
}) {
  const isActive = selectedRoomId === group.id;
  const hasUnread = useRoomUnread(group.id, currentUid, isActive);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full flex items-center gap-3 p-3 text-left transition-colors ${
        isActive
          ? "bg-identity/10 text-foreground border-l-2 border-l-identity"
          : "text-muted hover:text-foreground hover:bg-secondary/15 border-l-2 border-l-transparent"
      }`}
    >
      {hasUnread && (
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 size-2 rounded-full bg-identity shrink-0"
          aria-label="Unread messages"
        />
      )}
      <div className="w-12 h-12 bg-secondary/35 text-secondary-fg flex items-center justify-center font-black shrink-0 text-lg">
        {group.name[0].toUpperCase()}
      </div>
      <div className="flex-1 text-left min-w-0 pr-4">
        <p className="text-sm font-bold truncate">{group.name}</p>
        <p className="text-xs text-muted font-medium">{group.participants.length} members</p>
      </div>
    </button>
  );
}

function DirectChatRow({
  user,
  currentUid,
  selectedRoomId,
  onSelect,
}: {
  user: UserData;
  currentUid: string;
  selectedRoomId?: string;
  onSelect: () => void;
}) {
  const dmRoomId = directRoomId(currentUid, user.uid);
  const isActive = selectedRoomId === user.uid;
  const hasUnread = useRoomUnread(dmRoomId, currentUid, isActive);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full flex items-center gap-3 p-3 text-left transition-colors ${
        isActive
          ? "bg-identity/10 text-foreground border-l-2 border-l-identity"
          : "text-muted hover:text-foreground hover:bg-secondary/15 border-l-2 border-l-transparent"
      }`}
    >
      {hasUnread && (
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 size-2 rounded-full bg-identity shrink-0"
          aria-label="Unread messages"
        />
      )}
      <div className="relative shrink-0">
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-12 h-12 object-cover" />
        ) : (
          <div className="w-12 h-12 bg-secondary/35 flex items-center justify-center text-lg font-black text-secondary-fg">
            {(user.displayName?.[0] || user.email[0]).toUpperCase()}
          </div>
        )}
        <div
          className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border border-background ${
            user.status === "online" ? "bg-identity" : "bg-muted"
          }`}
        />
      </div>
      <div className="flex-1 text-left min-w-0 pr-4">
        <p className="text-sm font-bold truncate">{user.displayName || user.email}</p>
        <p className="text-xs text-muted font-medium uppercase">{user.status}</p>
      </div>
    </button>
  );
}

=======
  onSelectUser: (user: any) => void;
  selectedRoomId?: string;
}

>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
export default function UserSidebar({ onSelectUser, selectedRoomId }: UserSidebarProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [groups, setGroups] = useState<RoomData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

<<<<<<< HEAD
=======
    // Listen for individual users
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    const usersQ = query(collection(db, "users"), where("uid", "!=", currentUser.uid));
    const unsubUsers = onSnapshot(usersQ, (snapshot) => {
      const userData: UserData[] = [];
      snapshot.forEach((doc) => userData.push(doc.data() as UserData));
      setUsers(userData);
    });

<<<<<<< HEAD
=======
    // Listen for groups current user is part of
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    const groupsQ = query(
      collection(db, "rooms"),
      where("type", "==", "group"),
      where("participants", "array-contains", currentUser.uid)
    );
    const unsubGroups = onSnapshot(groupsQ, (snapshot) => {
      const groupData: RoomData[] = [];
      snapshot.forEach((doc) => groupData.push({ id: doc.id, ...doc.data() } as RoomData));
      setGroups(groupData);
    });

    return () => {
      unsubUsers();
      unsubGroups();
    };
  }, [currentUser]);

<<<<<<< HEAD
  const filteredUsers = users.filter(
    (u) =>
      u.uid !== currentUser?.uid &&
      (u.displayName || u.email).toLowerCase().includes(searchTerm.toLowerCase())
=======
  const filteredUsers = users.filter((u) =>
    u.uid !== currentUser?.uid &&
    (u.displayName || u.email).toLowerCase().includes(searchTerm.toLowerCase())
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

<<<<<<< HEAD
  if (!currentUser) return null;

  return (
    <div className="w-full md:w-80 h-full bg-background border-r border-border flex flex-col overflow-hidden">
      <div className="p-4 space-y-4">
        <button
          type="button"
          onClick={() => setIsGroupModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-fg py-3 px-4 border border-border font-black uppercase text-xs tracking-widest hover:opacity-90 transition-opacity"
        >
          <Plus size={18} strokeWidth={2.5} /> New group
        </button>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            size={18}
            strokeWidth={2.5}
          />
          <input
            type="text"
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-input border border-border py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-identity transition-colors"
=======
  return (
    <div className="w-full md:w-80 h-full bg-slate-900 border-r border-slate-700 flex flex-col overflow-hidden">
      <div className="p-4 space-y-4">
        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
        >
          <Plus size={18} /> Create Group
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
          />
        </div>
      </div>

<<<<<<< HEAD
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-8 pb-4">
        {filteredGroups.length > 0 && (
          <div>
            <h3 className="px-4 text-[10px] font-black text-secondary uppercase tracking-widest mb-2 flex items-center gap-2">
              <Users size={12} strokeWidth={2.5} /> Groups
            </h3>
            <div className="space-y-1">
              {filteredGroups.map((group) => (
                <GroupChatRow
                  key={group.id}
                  group={group}
                  currentUid={currentUser.uid}
                  selectedRoomId={selectedRoomId}
                  onSelect={() => onSelectUser({ ...group, uid: group.id })}
                />
=======
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-6 pb-4">
        {/* Groups Section */}
        {filteredGroups.length > 0 && (
          <div>
            <h3 className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users size={12} /> Groups
            </h3>
            <div className="space-y-1">
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => onSelectUser({ ...group, uid: group.id })}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedRoomId === group.id
                      ? "bg-blue-600/20 text-blue-100 border-blue-500/50 border"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
                    {group.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{group.name}</p>
                    <p className="text-xs text-slate-500">{group.participants.length} members</p>
                  </div>
                </button>
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
              ))}
            </div>
          </div>
        )}

<<<<<<< HEAD
        <div>
          <h3 className="px-4 text-[10px] font-black text-secondary uppercase tracking-widest mb-2 flex items-center gap-2">
            <UserIcon size={12} strokeWidth={2.5} /> Direct
          </h3>
          <div className="space-y-1">
            {filteredUsers.length === 0 && filteredGroups.length === 0 ? (
              <p className="text-center text-muted text-sm font-medium mt-8">No results</p>
            ) : (
              filteredUsers.map((user) => (
                <DirectChatRow
                  key={user.uid}
                  user={user}
                  currentUid={currentUser.uid}
                  selectedRoomId={selectedRoomId}
                  onSelect={() => onSelectUser(user)}
                />
=======
        {/* Private Chats Section */}
        <div>
          <h3 className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <UserIcon size={12} /> Private Chats
          </h3>
          <div className="space-y-1">
            {filteredUsers.length === 0 && filteredGroups.length === 0 ? (
              <p className="text-center text-slate-500 text-sm mt-8">No chats found</p>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => onSelectUser(user)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedRoomId === user.uid
                      ? "bg-blue-600/20 text-blue-100 border-blue-500/50 border"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="relative shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-lg font-semibold text-slate-300">
                        {(user.displayName?.[0] || user.email[0]).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-2 border-slate-900 rounded-full ${
                        user.status === "online" ? "bg-green-500" : "bg-slate-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{user.displayName || user.email}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.status}</p>
                  </div>
                </button>
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
              ))
            )}
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
=======
      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
>>>>>>> a279fb3274b45118cb6a156a58b33a09935238b5
    </div>
  );
}
