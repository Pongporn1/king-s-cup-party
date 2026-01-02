import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, set, onValue, get, update } from 'firebase/database';
import { auth, database } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  userId: string | null;
  displayName: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (newName: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Create user entry in database if not exists
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
          const defaultName = `Player_${firebaseUser.uid.slice(0, 6)}`;
          await set(userRef, {
            id: firebaseUser.uid,
            displayName: defaultName,
            createdAt: Date.now(),
            friends: {},
            friendRequests: {}
          });
          setDisplayName(defaultName);
        } else {
          setDisplayName(snapshot.val().displayName);
        }

        // Listen to displayName changes
        const displayNameRef = ref(database, `users/${firebaseUser.uid}/displayName`);
        onValue(displayNameRef, (snap) => {
          if (snap.exists()) {
            setDisplayName(snap.val());
          }
        });
      } else {
        setDisplayName(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateDisplayName = async (newName: string): Promise<boolean> => {
    if (!user) return false;
    
    const trimmedName = newName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 20) return false;

    try {
      const userRef = ref(database, `users/${user.uid}`);
      await update(userRef, { displayName: trimmedName });
      
      // Update displayName in all friends' friend lists
      const friendsRef = ref(database, `users/${user.uid}/friends`);
      const friendsSnapshot = await get(friendsRef);
      
      if (friendsSnapshot.exists()) {
        const friendIds = Object.keys(friendsSnapshot.val());
        const updates: Record<string, string> = {};
        
        friendIds.forEach(friendId => {
          updates[`users/${friendId}/friends/${user.uid}/displayName`] = trimmedName;
        });
        
        if (Object.keys(updates).length > 0) {
          await update(ref(database), updates);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Update displayName error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    userId: user?.uid || null,
    displayName,
    loading,
    login,
    logout,
    updateDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
