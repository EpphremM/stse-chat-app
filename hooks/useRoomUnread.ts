"use client";

import { startTransition, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Unread = last message from someone else is newer than our lastReadAt on the room doc. */
export function useRoomUnread(
  roomId: string | null,
  currentUserId: string | undefined,
  isActiveChat: boolean
) {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!roomId || !currentUserId) {
      startTransition(() => setHasUnread(false));
      return;
    }

    const unsub = onSnapshot(doc(db, "rooms", roomId), (snap) => {
      const apply = (next: boolean) => startTransition(() => setHasUnread(next));

      if (isActiveChat) {
        apply(false);
        return;
      }
      const d = snap.data();
      if (!d?.lastMessageAt || !d?.lastMessageSenderId) {
        apply(false);
        return;
      }
      if (d.lastMessageSenderId === currentUserId) {
        apply(false);
        return;
      }

      const lastReadRaw = d.lastReadAt?.[currentUserId] as Timestamp | undefined;
      const lastMsg = d.lastMessageAt as Timestamp;

      if (!lastReadRaw) {
        apply(true);
        return;
      }

      apply(lastMsg.toMillis() > lastReadRaw.toMillis());
    });

    return () => unsub();
  }, [roomId, currentUserId, isActiveChat]);

  return hasUnread;
}
