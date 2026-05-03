import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function directRoomId(uidA: string, uidB: string) {
  return [uidA, uidB].sort().join("_");
}

/** Merge-only: last message + preview for sidebar / unread. */
export async function bumpRoomActivity(
  roomId: string,
  senderId: string,
  preview: string
) {
  await setDoc(
    doc(db, "rooms", roomId),
    {
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: senderId,
      lastMessagePreview: preview.slice(0, 200),
    },
    { merge: true }
  );
}

/** Current user opened this chat — clears unread for them. */
export async function touchRoomRead(roomId: string, userId: string) {
  const roomRef = doc(db, "rooms", roomId);
  try {
    await updateDoc(roomRef, {
      [`lastReadAt.${userId}`]: serverTimestamp(),
    } as Record<string, unknown>);
  } catch {
    await setDoc(
      roomRef,
      { lastReadAt: { [userId]: serverTimestamp() } },
      { merge: true }
    );
  }
}

/** DM only: mark others’ messages as read + timestamp (for read receipts). */
export async function markDmIncomingAsRead(roomId: string, readerId: string) {
  const snap = await getDocs(
    query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "desc"),
      limit(100)
    )
  );
  const batch = writeBatch(db);
  let count = 0;
  for (const d of snap.docs) {
    const m = d.data();
    if (m.senderId !== readerId && m.read === false) {
      batch.update(d.ref, { read: true, readAt: serverTimestamp() });
      count++;
      if (count >= 400) break;
    }
  }
  if (count > 0) await batch.commit();
}
