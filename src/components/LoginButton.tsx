import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendSystem } from "@/hooks/useFriendSystem";
import { Button } from "@/components/ui/button";
import { FriendSystem } from "@/components/FriendSystem";
import { LogIn, Users, Loader2, Bell } from "lucide-react";
import { toast } from "sonner";

interface LoginButtonProps {
  currentRoomCode?: string;
  currentGameType?: string;
  currentGameName?: string;
  onJoinRoom?: (roomCode: string, gameType: string) => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  currentRoomCode,
  currentGameType,
  currentGameName,
  onJoinRoom,
}) => {
  const { user, loading, login } = useAuth();
  const { gameInvites, friendRequests } = useFriendSystem();
  const [showFriendSystem, setShowFriendSystem] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
      toast.success("เข้าสู่ระบบแล้ว!");
    } catch (error) {
      toast.error("เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const totalNotifications =
    (gameInvites?.length || 0) + (friendRequests?.length || 0);

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-white">
        <Loader2 className="animate-spin" size={18} />
      </Button>
    );
  }

  return (
    <>
      {user ? (
        <Button
          onClick={() => setShowFriendSystem(true)}
          size="sm"
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 relative text-white"
        >
          <Users size={16} className="mr-1" />
          เพื่อน
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center animate-pulse">
              {totalNotifications}
            </span>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleLogin}
          disabled={isLoggingIn}
          size="sm"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          data-login-button="true"
        >
          {isLoggingIn ? (
            <Loader2 className="animate-spin mr-1" size={16} />
          ) : (
            <LogIn size={16} className="mr-1" />
          )}
          เข้าระบบ
        </Button>
      )}

      <AnimatePresence>
        {showFriendSystem && (
          <FriendSystem
            onClose={() => setShowFriendSystem(false)}
            currentRoomCode={currentRoomCode}
            currentGameType={currentGameType}
            currentGameName={currentGameName}
            onJoinRoom={onJoinRoom}
          />
        )}
      </AnimatePresence>
    </>
  );
};
