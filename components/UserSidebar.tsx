"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { directRoomId } from "@/lib/chatRoom";
import { useRoomUnread } from "@/hooks/useRoomUnread";
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
      className={`relative w-full flex items-center gap-3 p-3 text-left transition-colors ${isActive
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
      className={`relative w-full flex items-center gap-3 p-3 text-left transition-colors ${isActive
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
          className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border border-background ${user.status === "online" ? "bg-identity" : "bg-muted"
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

export default function UserSidebar({ onSelectUser, selectedRoomId }: UserSidebarProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [groups, setGroups] = useState<RoomData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const usersQ = query(collection(db, "users"), where("uid", "!=", currentUser.uid));
    const unsubUsers = onSnapshot(usersQ, (snapshot) => {
      const userData: UserData[] = [];
      snapshot.forEach((doc) => userData.push(doc.data() as UserData));
      setUsers(userData);
    });

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

  const filteredUsers = users.filter(
    (u) =>
      u.uid !== currentUser?.uid &&
      (u.displayName || u.email).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          />
        </div>
      </div>

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
              ))}
            </div>
          </div>
        )}

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
              ))
            )}
          </div>
        </div>
      </div>

      <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
    </div>
  );
}
