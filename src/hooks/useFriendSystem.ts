import { useState, useEffect } from 'react';
import { ref, set, get, onValue, remove, push } from 'firebase/database';
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

export const useFriendSystem = () => {
  const { userId } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to friends list
  useEffect(() => {
    if (!userId) {
      setFriends([]);
      setFriendRequests([]);
      setLoading(false);
      return;
    }

    const friendsRef = ref(database, `users/${userId}/friends`);
    const requestsRef = ref(database, `users/${userId}/friendRequests`);

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

    return () => {
      unsubFriends();
      unsubRequests();
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
    
    // Get current user's display name
    const currentUserRef = ref(database, `users/${userId}`);
    const currentUserSnapshot = await get(currentUserRef);
    
    if (!currentUserSnapshot.exists()) return false;
    
    const currentUserData = currentUserSnapshot.val();
    
    // Check if already friends
    const friendRef = ref(database, `users/${userId}/friends/${targetUserId}`);
    const friendSnapshot = await get(friendRef);
    if (friendSnapshot.exists()) return false;
    
    // Add request to target user's friendRequests
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
    
    // Get current user's display name
    const currentUserRef = ref(database, `users/${userId}`);
    const currentUserSnapshot = await get(currentUserRef);
    
    if (!currentUserSnapshot.exists()) return false;
    
    const currentUserData = currentUserSnapshot.val();
    
    // Add to both users' friends lists
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
    
    // Remove the friend request
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

  return {
    friends,
    friendRequests,
    loading,
    searchUserById,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend
  };
};
