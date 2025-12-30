import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Copy, Check, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";
import ThemedBackground from "@/components/ThemedBackground";

interface FiveSecLobbyProps {
  onCreateRoom: (
    hostName: string,
    timeLimit?: number
  ) => Promise<string | null>;
  onJoinRoom: (code: string, playerName: string) => Promise<boolean>;
  onBack: () => void;
  isLoading: boolean;
}

export function FiveSecLobby({
  onCreateRoom,
  onJoinRoom,
  onBack,
  isLoading,
}: FiveSecLobbyProps) {
  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number>(5);

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    const code = await onCreateRoom(playerName.trim(), timeLimit);
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
          <div className="text-6xl mb-4">⏱️</div>
          <h1 className="text-3xl font-bold text-white mb-2">5 Second Rule</h1>
          <p className="text-white/70">บอกมา 3 อย่าง... ใน 5 วิ!</p>
        </div>

        {/* Card */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          {mode === "select" && (
            <div className="space-y-4">
              <Button
                onClick={() => setMode("create")}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 py-6 text-lg"
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

              {/* Time Selection */}
              <div>
                <label className="text-white/80 text-sm mb-3 block flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  เวลาในการตอบ
                </label>
                <RadioGroup
                  value={timeLimit.toString()}
                  onValueChange={(v) => setTimeLimit(Number(v))}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {[5, 10, 15, 20].map((time) => (
                      <div key={time} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={time.toString()}
                          id={`time-${time}`}
                          className="border-white/40"
                        />
                        <Label
                          htmlFor={`time-${time}`}
                          className="text-white cursor-pointer"
                        >
                          {time} วินาที
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={handleCreate}
                disabled={isLoading || !playerName.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
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
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
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
