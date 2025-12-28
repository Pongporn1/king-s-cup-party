/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Users, ArrowRight, Loader2, Zap, ArrowLeft } from "lucide-react";
import { FloatingNames } from "@/components/AdminPanel";
import { getFloatingNamesFromDB } from "@/lib/adminStorage";

interface PokDengLobbyProps {
  onCreateRoom: (hostName: string) => Promise<any>;
  onJoinRoom: (code: string, playerName: string) => Promise<any>;
  onQuickStart?: (hostName: string) => Promise<any>;
  isLoading: boolean;
  onBack?: () => void;
}

export function PokDengLobby({
  onCreateRoom,
  onJoinRoom,
  onQuickStart,
  isLoading,
  onBack,
}: PokDengLobbyProps) {
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [quickStartName, setQuickStartName] = useState("");
  const [showQuickStartModal, setShowQuickStartModal] = useState(false);
  const [floatingNames, setFloatingNames] = useState<string[]>([]);
  const secretCodeRef = useRef("");

  // Load floating names from Supabase
  useEffect(() => {
    const loadNames = async () => {
      const names = await getFloatingNamesFromDB();
      setFloatingNames(names);
    };
    loadNames();
  }, []);

  // Secret shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      const newCode = secretCodeRef.current + key;
      if ("adminhee444".startsWith(newCode)) {
        secretCodeRef.current = newCode;
        if (newCode === "adminhee444" && onQuickStart) {
          secretCodeRef.current = "";
          setShowQuickStartModal(true);
        }
      } else {
        secretCodeRef.current = "adminhee444".startsWith(key) ? key : "";
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onQuickStart]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await onCreateRoom(name.trim());
  };

  const handleJoin = async () => {
    if (!name.trim() || !roomCode.trim()) return;
    await onJoinRoom(roomCode.trim(), name.trim());
  };

  const handleQuickStart = async () => {
    if (!quickStartName.trim() || !onQuickStart) return;
    await onQuickStart(quickStartName.trim());
    setShowQuickStartModal(false);
    setQuickStartName("");
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Floating Names */}
      <FloatingNames names={floatingNames} />

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}bg-party.jpg')`,
        }}
      />
      {/* Dark overlay with green tint for Pok Deng */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/70 to-black/70" />

      {/* Back button */}
      {onBack && (
        <div className="absolute top-4 left-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Logo */}
      <div className="text-center mb-6 sm:mb-8 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          🎰 ไพ่ป๊อกเด้ง
        </h1>
        <p className="text-white/80 text-base sm:text-lg">เล่นหลายคน Online</p>
      </div>

      {/* Main Card */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl w-full max-w-xs sm:max-w-sm p-4 sm:p-6 relative z-10 border border-green-500/30">
        {mode === "menu" && (
          <div className="space-y-3">
            {/* สร้างห้องใหม่ */}
            <div className="space-y-1">
              <Button
                variant="default"
                size="lg"
                className="w-full bg-green-500 text-white hover:bg-green-600"
                onClick={() => setMode("create")}
              >
                <Plus className="w-5 h-5 mr-2" />
                สร้างห้องใหม่
              </Button>
              <p className="text-xs text-white/60 text-center">
                เปิดห้องให้เพื่อนเข้าร่วม
              </p>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black/40 px-2 text-white/60">หรือ</span>
              </div>
            </div>

            {/* เข้าร่วมห้อง */}
            <div className="space-y-1">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-green-500/50 text-white hover:bg-green-500/20"
                onClick={() => setMode("join")}
              >
                <Users className="w-5 h-5 mr-2" />
                เข้าร่วมห้อง
              </Button>
              <p className="text-xs text-white/60 text-center">
                ใส่รหัสห้องเพื่อเข้าร่วม
              </p>
            </div>
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white -ml-2"
              onClick={() => setMode("menu")}
            >
              <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
              กลับ
            </Button>
            <div>
              <label className="text-white text-sm mb-1 block">
                ชื่อของคุณ
              </label>
              <Input
                placeholder="ใส่ชื่อ..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={handleCreate}
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              สร้างห้อง
            </Button>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white -ml-2"
              onClick={() => setMode("menu")}
            >
              <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
              กลับ
            </Button>
            <div>
              <label className="text-white text-sm mb-1 block">รหัสห้อง</label>
              <Input
                placeholder="ใส่รหัสห้อง 6 ตัว..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 uppercase"
                maxLength={6}
              />
            </div>
            <div>
              <label className="text-white text-sm mb-1 block">
                ชื่อของคุณ
              </label>
              <Input
                placeholder="ใส่ชื่อ..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={handleJoin}
              disabled={isLoading || !name.trim() || !roomCode.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              เข้าร่วม
            </Button>
          </div>
        )}
      </div>

      {/* Quick Start Modal */}
      <Dialog open={showQuickStartModal} onOpenChange={setShowQuickStartModal}>
        <DialogContent className="bg-black/90 border-green-500/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-green-400">🚀 Quick Start</DialogTitle>
            <DialogDescription className="text-white/70">
              เริ่มห้องใหม่ทันที
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="ใส่ชื่อ..."
              value={quickStartName}
              onChange={(e) => setQuickStartName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              onKeyDown={(e) => e.key === "Enter" && handleQuickStart()}
            />
            <Button
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={handleQuickStart}
              disabled={isLoading || !quickStartName.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              เริ่มเลย!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="absolute bottom-4 text-white/40 text-xs text-center z-10">
        เล่นได้ 2-8 คน
      </div>
    </div>
  );
}
