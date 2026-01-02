import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, Check, Users } from "lucide-react";
import { motion } from "framer-motion";
import ThemedBackground from "@/components/ThemedBackground";
import { ParanoiaQuestionManager } from "@/components/ParanoiaQuestionManager";
import { useAuth } from "@/contexts/AuthContext";

interface ParanoiaLobbyProps {
  onCreateRoom: (hostName: string) => Promise<string | null>;
  onJoinRoom: (code: string, playerName: string) => Promise<boolean>;
  onBack: () => void;
  isLoading: boolean;
}

export function ParanoiaLobby({
  onCreateRoom,
  onJoinRoom,
  onBack,
  isLoading,
}: ParanoiaLobbyProps) {
  const { displayName: authDisplayName } = useAuth();
  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-fill name from Firebase displayName
  useEffect(() => {
    if (authDisplayName && !playerName) {
      setPlayerName(authDisplayName);
    }
  }, [authDisplayName]);

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    const code = await onCreateRoom(playerName.trim());
    if (code) {
      setCreatedCode(code);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    await onJoinRoom(roomCode.trim(), playerName.trim());
  };

  const copyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 relative">
      <ThemedBackground />

      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="absolute top-4 left-4 text-white hover:bg-white/10 z-10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        กลับ
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤫</div>
          <h1 className="text-3xl font-bold text-white mb-2">Paranoia</h1>
          <p className="text-white/70">เกมขี้ระแวง / คำถามกระซิบ</p>
        </div>

        {/* Question Manager Button */}
        <div className="flex justify-center mb-4">
          <ParanoiaQuestionManager />
        </div>

        {/* Card */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          {mode === "select" && (
            <div className="space-y-4">
              <Button
                onClick={() => setMode("create")}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 py-6 text-lg"
              >
                <Users className="w-5 h-5 mr-2" />
                สร้างห้อง
              </Button>
              <Button
                onClick={() => setMode("join")}
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10 py-6 text-lg"
              >
                เข้าร่วมห้อง
              </Button>
            </div>
          )}

          {mode === "create" && !createdCode && (
            <div className="space-y-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  ชื่อของคุณ
                </label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="ใส่ชื่อ..."
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={isLoading || !playerName.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600"
              >
                {isLoading ? "กำลังสร้าง..." : "สร้างห้อง"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setMode("select")}
                className="w-full text-white/60"
              >
                กลับ
              </Button>
            </div>
          )}

          {mode === "create" && createdCode && (
            <div className="text-center space-y-4">
              <p className="text-white/80">รหัสห้องของคุณ:</p>
              <div
                onClick={copyCode}
                className="bg-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-colors"
              >
                <p className="text-4xl font-mono font-bold text-white tracking-wider">
                  {createdCode}
                </p>
              </div>
              <Button
                onClick={copyCode}
                variant="outline"
                className="border-white/30 text-white"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> คัดลอกแล้ว!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" /> คัดลอกรหัส
                  </>
                )}
              </Button>
              <p className="text-white/60 text-sm">
                แชร์รหัสนี้ให้เพื่อนเพื่อเข้าร่วม
              </p>
            </div>
          )}

          {mode === "join" && (
            <div className="space-y-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  ชื่อของคุณ
                </label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="ใส่ชื่อ..."
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  รหัสห้อง
                </label>
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  className="bg-white/10 border-white/20 text-white text-center font-mono tracking-wider"
                  maxLength={6}
                />
              </div>
              <Button
                onClick={handleJoin}
                disabled={isLoading || !playerName.trim() || !roomCode.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600"
              >
                {isLoading ? "กำลังเข้าร่วม..." : "เข้าร่วมห้อง"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setMode("select")}
                className="w-full text-white/60"
              >
                กลับ
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
