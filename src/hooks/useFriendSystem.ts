import { useState, useEffect } from 'react';
import { ref, set, get, onValue, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Friend {
  id: string;
  displayName: string;
  addedAt: number;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  sentAt: number;
}

export interface GameInvite {
  id: string;
  fromId: string;
  fromName: string;
  roomCode: string;
  gameType: string;
  gameName: string;
  sentAt: number;
}

export const useFriendSystem = () => {
  const { userId } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [gameInvites, setGameInvites] = useState<GameInvite[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to friends list, requests, and game invites
  useEffect(() => {
    if (!userId) {
      setFriends([]);
      setFriendRequests([]);
      setGameInvites([]);
      setLoading(false);
      return;
    }

    const friendsRef = ref(database, `users/${userId}/friends`);
    const requestsRef = ref(database, `users/${userId}/friendRequests`);
    const invitesRef = ref(database, `users/${userId}/gameInvites`);

    const unsubFriends = onValue(friendsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const friendsList: Friend[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          displayName: value.displayName,
          addedAt: value.addedAt
        }));
        setFriends(friendsList);
      } else {
        setFriends([]);
      }
      setLoading(false);
    });

    const unsubRequests = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestsList: FriendRequest[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          fromId: value.fromId,
          fromName: value.fromName,
          sentAt: value.sentAt
        }));
        setFriendRequests(requestsList);
      } else {
        setFriendRequests([]);
      }
    });

    const unsubInvites = onValue(invitesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const invitesList: GameInvite[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          fromId: value.fromId,
          fromName: value.fromName,
          roomCode: value.roomCode,
          gameType: value.gameType,
          gameName: value.gameName,
          sentAt: value.sentAt
        }));
        // Filter out expired invites (older than 10 minutes)
        const validInvites = invitesList.filter(inv => Date.now() - inv.sentAt < 10 * 60 * 1000);
        setGameInvites(validInvites);
      } else {
        setGameInvites([]);
      }
    });

    return () => {
      unsubFriends();
      unsubRequests();
      unsubInvites();
    };
  }, [userId]);

  // Search user by ID
  const searchUserById = async (searchId: string): Promise<{ id: string; displayName: string } | null> => {
    if (!searchId || searchId === userId) return null;
    
    const userRef = ref(database, `users/${searchId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        id: data.id,
        displayName: data.displayName
      };
    }
    return null;
  };

  // Send friend request
  const sendFriendRequest = async (targetUserId: string) => {
    if (!userId) return false;
    
    const currentUserRef = ref(database, `users/${userId}`);
    const currentUserSnapshot = await get(currentUserRef);
    
    if (!currentUserSnapshot.exists()) return false;
    
    const currentUserData = currentUserSnapshot.val();
    
    const friendRef = ref(database, `users/${userId}/friends/${targetUserId}`);
    const friendSnapshot = await get(friendRef);
    if (friendSnapshot.exists()) return false;
    
    const requestRef = ref(database, `users/${targetUserId}/friendRequests/${userId}`);
    await set(requestRef, {
      fromId: userId,
      fromName: currentUserData.displayName,
      sentAt: Date.now()
    });
    
    return true;
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId: string, fromId: string, fromName: string) => {
    if (!userId) return false;
    
    const currentUserRef = ref(database, `users/${userId}`);
    const currentUserSnapshot = await get(currentUserRef);
    
    if (!currentUserSnapshot.exists()) return false;
    
    const currentUserData = currentUserSnapshot.val();
    
    const myFriendRef = ref(database, `users/${userId}/friends/${fromId}`);
    const theirFriendRef = ref(database, `users/${fromId}/friends/${userId}`);
    
    await set(myFriendRef, {
      displayName: fromName,
      addedAt: Date.now()
    });
    
    await set(theirFriendRef, {
      displayName: currentUserData.displayName,
      addedAt: Date.now()
    });
    
    const requestRef = ref(database, `users/${userId}/friendRequests/${requestId}`);
    await remove(requestRef);
    
    return true;
  };

  // Decline friend request
  const declineFriendRequest = async (requestId: string) => {
    if (!userId) return false;
    
    const requestRef = ref(database, `users/${userId}/friendRequests/${requestId}`);
    await remove(requestRef);
    
    return true;
  };

  // Remove friend
  const removeFriend = async (friendId: string) => {
    if (!userId) return false;
    
    const myFriendRef = ref(database, `users/${userId}/friends/${friendId}`);
    const theirFriendRef = ref(database, `users/${friendId}/friends/${userId}`);
    
    await remove(myFriendRef);
    await remove(theirFriendRef);
    
    return true;
  };

  // Send game invite to a friend
  const sendGameInvite = async (friendId: string, roomCode: string, gameType: string, gameName: string) => {
    if (!userId) return false;
    
    const currentUserRef = ref(database, `users/${userId}`);
    const currentUserSnapshot = await get(currentUserRef);
    
    if (!currentUserSnapshot.exists()) return false;
    
    const currentUserData = currentUserSnapshot.val();
    
    const inviteRef = ref(database, `users/${friendId}/gameInvites/${Date.now()}`);
    await set(inviteRef, {
      fromId: userId,
      fromName: currentUserData.displayName,
      roomCode,
      gameType,
      gameName,
      sentAt: Date.now()
    });
    
    return true;
  };

  // Dismiss game invite
  const dismissGameInvite = async (inviteId: string) => {
    if (!userId) return false;
    
    const inviteRef = ref(database, `users/${userId}/gameInvites/${inviteId}`);
    await remove(inviteRef);
    
    return true;
  };

  return {
    friends,
    friendRequests,
    gameInvites,
    loading,
    searchUserById,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    sendGameInvite,
    dismissGameInvite
  };
};
