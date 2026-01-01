import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useFriendSystem } from '@/hooks/useFriendSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  UserPlus, 
  Check, 
  X, 
  LogOut, 
  Copy, 
  UserMinus,
  Bell,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface FriendSystemProps {
  onClose: () => void;
}

export const FriendSystem: React.FC<FriendSystemProps> = ({ onClose }) => {
  const { user, userId, logout } = useAuth();
  const { 
    friends, 
    friendRequests, 
    loading, 
    searchUserById, 
    sendFriendRequest, 
    acceptFriendRequest, 
    declineFriendRequest,
    removeFriend 
  } = useFriendSystem();

  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<{ id: string; displayName: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    
    setIsSearching(true);
    const result = await searchUserById(searchId.trim());
    setSearchResult(result);
    setIsSearching(false);
    
    if (!result) {
      toast.error('ไม่พบผู้ใช้');
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;
    
    const success = await sendFriendRequest(searchResult.id);
    if (success) {
      toast.success('ส่งคำขอเป็นเพื่อนแล้ว!');
      setSearchResult(null);
      setSearchId('');
    } else {
      toast.error('ไม่สามารถส่งคำขอได้');
    }
  };

  const handleAcceptRequest = async (requestId: string, fromId: string, fromName: string) => {
    const success = await acceptFriendRequest(requestId, fromId, fromName);
    if (success) {
      toast.success(`เพิ่ม ${fromName} เป็นเพื่อนแล้ว!`);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    await declineFriendRequest(requestId);
    toast.info('ปฏิเสธคำขอแล้ว');
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    const success = await removeFriend(friendId);
    if (success) {
      toast.info(`ลบ ${friendName} ออกจากรายชื่อเพื่อนแล้ว`);
    }
  };

  const copyUserId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      toast.success('คัดลอก ID แล้ว!');
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    toast.info('ออกจากระบบแล้ว');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg">ระบบเพื่อน</h2>
                <p className="text-xs text-white/70">ID: {userId?.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={copyUserId}
                className="text-white hover:bg-white/20"
              >
                <Copy size={18} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:bg-white/20"
              >
                <LogOut size={18} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-700">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'friends' 
                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            เพื่อน ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'requests' 
                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bell size={16} className="inline mr-2" />
            คำขอ
            {friendRequests.length > 0 && (
              <span className="absolute top-2 right-4 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'search' 
                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Search size={16} className="inline mr-2" />
            ค้นหา
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : (
            <>
              {/* Friends Tab */}
              {activeTab === 'friends' && (
                <div className="space-y-2">
                  {friends.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8">ยังไม่มีเพื่อน</p>
                  ) : (
                    friends.map((friend) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-bold">
                            {friend.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{friend.displayName}</p>
                            <p className="text-xs text-zinc-500">ID: {friend.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveFriend(friend.id, friend.displayName)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <UserMinus size={18} />
                        </Button>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div className="space-y-2">
                  {friendRequests.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8">ไม่มีคำขอเป็นเพื่อน</p>
                  ) : (
                    friendRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                            {request.fromName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{request.fromName}</p>
                            <p className="text-xs text-zinc-500">ต้องการเป็นเพื่อน</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            onClick={() => handleAcceptRequest(request.id, request.fromId, request.fromName)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check size={18} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeclineRequest(request.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <X size={18} />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Search Tab */}
              {activeTab === 'search' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      placeholder="วาง ID ของเพื่อน..."
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                    </Button>
                  </div>

                  {searchResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-cyan-500/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-lg">
                          {searchResult.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-lg">{searchResult.displayName}</p>
                          <p className="text-xs text-zinc-500">ID: {searchResult.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <Button onClick={handleSendRequest} className="bg-cyan-600 hover:bg-cyan-700">
                        <UserPlus size={18} className="mr-2" />
                        เพิ่มเพื่อน
                      </Button>
                    </motion.div>
                  )}

                  <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
                    <p className="text-sm text-zinc-400 text-center">
                      แชร์ ID ของคุณให้เพื่อน:
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <code className="bg-zinc-900 px-3 py-2 rounded text-cyan-400 text-sm">
                        {userId}
                      </code>
                      <Button size="icon" variant="ghost" onClick={copyUserId}>
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
