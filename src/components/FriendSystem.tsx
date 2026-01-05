import React, { useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendSystem } from "@/hooks/useFriendSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Loader2,
  Gamepad2,
  Send,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

interface FriendSystemProps {
  onClose: () => void;
  currentRoomCode?: string;
  currentGameType?: string;
  currentGameName?: string;
  onJoinRoom?: (roomCode: string, gameType: string) => void;
}

export const FriendSystem: React.FC<FriendSystemProps> = ({
  onClose,
  currentRoomCode,
  currentGameType,
  currentGameName,
  onJoinRoom,
}) => {
  const { userId, displayName, logout, updateDisplayName } = useAuth();
  const {
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
    dismissGameInvite,
  } = useFriendSystem();

  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<{
    id: string;
    displayName: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "friends" | "requests" | "invites" | "search"
  >("friends");
  const [sendingInviteTo, setSendingInviteTo] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(displayName || "");
  const [isSavingName, setIsSavingName] = useState(false);

  const handleSaveName = async () => {
    if (newDisplayName.trim().length < 2) {
      toast.error("ชื่อต้องมีอย่างน้อย 2 ตัวอักษร");
      return;
    }
    if (newDisplayName.trim().length > 20) {
      toast.error("ชื่อต้องไม่เกิน 20 ตัวอักษร");
      return;
    }

    setIsSavingName(true);
    const success = await updateDisplayName(newDisplayName.trim());
    setIsSavingName(false);

    if (success) {
      toast.success("เปลี่ยนชื่อสำเร็จ!");
      setIsEditingName(false);
    } else {
      toast.error("ไม่สามารถเปลี่ยนชื่อได้");
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) return;

    setIsSearching(true);
    const result = await searchUserById(searchId.trim());
    setSearchResult(result);
    setIsSearching(false);

    if (!result) {
      toast.error("ไม่พบผู้ใช้");
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;

    const success = await sendFriendRequest(searchResult.id);
    if (success) {
      toast.success("ส่งคำขอเป็นเพื่อนแล้ว!");
      setSearchResult(null);
      setSearchId("");
    } else {
      toast.error("ไม่สามารถส่งคำขอได้");
    }
  };

  const handleAcceptRequest = async (
    requestId: string,
    fromId: string,
    fromName: string
  ) => {
    const success = await acceptFriendRequest(requestId, fromId, fromName);
    if (success) {
      toast.success(`เพิ่ม ${fromName} เป็นเพื่อนแล้ว!`);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    await declineFriendRequest(requestId);
    toast.info("ปฏิเสธคำขอแล้ว");
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    const success = await removeFriend(friendId);
    if (success) {
      toast.info(`ลบ ${friendName} ออกจากรายชื่อเพื่อนแล้ว`);
    }
  };

  const handleSendGameInvite = async (friendId: string, friendName: string) => {
    if (!currentRoomCode || !currentGameType || !currentGameName) {
      toast.error("คุณยังไม่ได้อยู่ในห้องเกม");
      return;
    }

    setSendingInviteTo(friendId);
    const success = await sendGameInvite(
      friendId,
      currentRoomCode,
      currentGameType,
      currentGameName
    );
    setSendingInviteTo(null);

    if (success) {
      toast.success(`ส่งคำเชิญไปยัง ${friendName} แล้ว!`);
    } else {
      toast.error("ไม่สามารถส่งคำเชิญได้");
    }
  };

  const handleAcceptInvite = async (invite: (typeof gameInvites)[0]) => {
    console.log("🎉 Accepting invite:", invite);
    await dismissGameInvite(invite.id);

    if (onJoinRoom) {
      console.log("✅ onJoinRoom exists, calling it...");
      toast.success(`กำลังเข้าห้อง ${invite.roomCode}...`);
      // Close modal first so user can see the lobby
      onClose();
      // Then join the room
      try {
        await onJoinRoom(invite.roomCode, invite.gameType);
        console.log("🎮 Successfully joined room");
      } catch (error) {
        console.error("❌ Error joining room:", error);
        toast.error("ไม่สามารถเข้าห้องได้");
      }
    } else {
      console.log("⚠️ No onJoinRoom handler provided");
      // Copy room code if no join handler
      navigator.clipboard.writeText(invite.roomCode);
      toast.success(`คัดลอกรหัสห้อง ${invite.roomCode} แล้ว!`);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    await dismissGameInvite(inviteId);
    toast.info("ปฏิเสธคำเชิญแล้ว");
  };

  const copyUserId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      toast.success("คัดลอก ID แล้ว!");
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    toast.info("ออกจากระบบแล้ว");
  };

  const totalNotifications = friendRequests.length + gameInvites.length;

  // Use Portal to render outside of parent DOM tree
  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden border border-zinc-700"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                {displayName?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      className="h-8 w-32 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="ชื่อใหม่..."
                      maxLength={20}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      {isSavingName ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Check size={16} />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsEditingName(false);
                        setNewDisplayName(displayName || "");
                      }}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg">{displayName}</h2>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setNewDisplayName(displayName || "");
                        setIsEditingName(true);
                      }}
                      className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20"
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-white/70">
                  ID: {userId?.slice(0, 8)}...
                </p>
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
            onClick={() => setActiveTab("friends")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "friends"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users size={16} className="inline mr-1" />
            เพื่อน
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "requests"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Bell size={16} className="inline mr-1" />
            คำขอ
            {friendRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 rounded-full text-xs">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("invites")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "invites"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Gamepad2 size={16} className="inline mr-1" />
            เชิญ
            {gameInvites.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-green-500 rounded-full text-xs">
                {gameInvites.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "search"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Search size={16} className="inline" />
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
              {activeTab === "friends" && (
                <div className="space-y-2">
                  {currentRoomCode && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg border border-green-500/30">
                      <p className="text-sm text-green-400 flex items-center gap-2">
                        <Gamepad2 size={16} />
                        คุณอยู่ในห้อง:{" "}
                        <span className="font-bold">{currentRoomCode}</span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        กดปุ่มเชิญเพื่อชวนเพื่อนเข้าห้อง
                      </p>
                    </div>
                  )}
                  {friends.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8">
                      ยังไม่มีเพื่อน
                    </p>
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
                            <p className="text-xs text-zinc-500">
                              ID: {friend.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {currentRoomCode && (
                            <Button
                              size="icon"
                              onClick={() =>
                                handleSendGameInvite(
                                  friend.id,
                                  friend.displayName
                                )
                              }
                              disabled={sendingInviteTo === friend.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {sendingInviteTo === friend.id ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <Send size={18} />
                              )}
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              handleRemoveFriend(friend.id, friend.displayName)
                            }
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <UserMinus size={18} />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === "requests" && (
                <div className="space-y-2">
                  {friendRequests.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8">
                      ไม่มีคำขอเป็นเพื่อน
                    </p>
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
                            <p className="text-xs text-zinc-500">
                              ต้องการเป็นเพื่อน
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            onClick={() =>
                              handleAcceptRequest(
                                request.id,
                                request.fromId,
                                request.fromName
                              )
                            }
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

              {/* Game Invites Tab */}
              {activeTab === "invites" && (
                <div className="space-y-2">
                  {gameInvites.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8">
                      ไม่มีคำเชิญเข้าเกม
                    </p>
                  ) : (
                    gameInvites.map((invite) => (
                      <motion.div
                        key={invite.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-zinc-800 rounded-lg border border-green-500/30"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center font-bold">
                            {invite.fromName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{invite.fromName}</p>
                            <p className="text-xs text-zinc-500">
                              เชิญคุณเล่น {invite.gameName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-zinc-900 px-3 py-2 rounded text-sm">
                            <span className="text-zinc-400">รหัสห้อง: </span>
                            <span className="text-green-400 font-mono font-bold">
                              {invite.roomCode}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvite(invite)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check size={16} className="mr-1" />
                            เข้าร่วม
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeclineInvite(invite.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <X size={18} />
                          </Button>
                        </div>
                        <p className="text-xs text-zinc-600 mt-2">
                          หมดอายุใน{" "}
                          {Math.max(
                            0,
                            Math.ceil(
                              (10 * 60 * 1000 - (Date.now() - invite.sentAt)) /
                                60000
                            )
                          )}{" "}
                          นาที
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Search Tab */}
              {activeTab === "search" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      placeholder="วาง ID ของเพื่อน..."
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Search size={18} />
                      )}
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
                          <p className="font-medium text-lg">
                            {searchResult.displayName}
                          </p>
                          <p className="text-xs text-zinc-500">
                            ID: {searchResult.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleSendRequest}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
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
                      <code className="bg-zinc-900 px-3 py-2 rounded text-cyan-400 text-sm break-all">
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
    </motion.div>,
    document.body
  );
};
