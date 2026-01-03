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
import { Plus, Users, ArrowRight, Loader2, Zap } from "lucide-react";
import { AdminPanel, FloatingNames } from "@/components/AdminPanel";
import { getFloatingNamesFromDB } from "@/lib/adminStorage";
import { t } from "@/lib/i18n";
import { validateName } from "@/lib/nameValidation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LobbyProps {
  onCreateRoom: (hostName: string) => Promise<any>;
  onJoinRoom: (code: string, playerName: string) => Promise<any>;
  onQuickStart?: (hostName: string) => Promise<any>;
  isLoading: boolean;
  onBack?: () => void;
}

export function Lobby({
  onCreateRoom,
  onJoinRoom,
  onQuickStart,
  isLoading,
  onBack,
}: LobbyProps) {
  const { displayName: authDisplayName } = useAuth();
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [quickStartName, setQuickStartName] = useState("");
  const [showQuickStartModal, setShowQuickStartModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [floatingNames, setFloatingNames] = useState<string[]>([]);
  const secretCodeRef = useRef("");
  const { toast } = useToast();

  // Auto-fill name from Firebase displayName
  useEffect(() => {
    if (authDisplayName && !name) {
      setName(authDisplayName);
    }
  }, [authDisplayName]);

  // Load floating names from database on mount and when admin panel closes
  useEffect(() => {
    const loadNames = async () => {
      const names = await getFloatingNamesFromDB();
      setFloatingNames(names);
    };
    loadNames();
  }, [showAdminPanel]); // Refresh when admin panel closes

  // Secret shortcut: type "adminhee444" anywhere to quick start
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
    const validation = validateName(name);
    if (!validation.isValid) {
      toast({
        title: t("error"),
        description: validation.error || t("invalidName"),
        variant: "destructive",
      });
      return;
    }
    await onCreateRoom(name.trim());
  };

  const handleJoin = async () => {
    if (!name.trim() || !roomCode.trim()) return;

    // Secret admin access: code 777777 + name BONNE
    if (roomCode.trim() === "777777" && name.trim().toUpperCase() === "BONNE") {
      setShowAdminPanel(true);
      return;
    }

    const validation = validateName(name);
    if (!validation.isValid) {
      toast({
        title: t("error"),
        description: validation.error || t("invalidName"),
        variant: "destructive",
      });
      return;
    }

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

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}bg-party.jpg')`,
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Back button */}
      {onBack && (
        <div className="absolute top-4 left-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Button>
        </div>
      )}

      {/* Logo */}
      <div className="text-center mb-6 sm:mb-8 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          🍻{t("kingsCup")}
        </h1>
        <p className="text-white/80 text-base sm:text-lg">
          {t("kingsCupSubtitle")}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl w-full max-w-xs sm:max-w-sm p-4 sm:p-6 relative z-10 border border-white/10">
        {mode === "menu" && (
          <div className="space-y-3">
            {/* สร้างห้องใหม่ - Host เล่นด้วย */}
            <div className="space-y-1">
              <Button
                variant="default"
                size="lg"
                className="w-full bg-white text-black hover:bg-white/90"
                onClick={() => setMode("create")}
              >
                <Plus className="w-5 h-5" />
                {t("createNewRoom")}
              </Button>
              <p className="text-white/50 text-xs text-center"></p>
            </div>

            {/* เข้าร่วมห้อง */}
            <Button
              variant="outline"
              size="lg"
              className="w-full border-white/30 text-white hover:bg-white/10"
              onClick={() => setMode("join")}
            >
              <Users className="w-5 h-5" />
              {t("joinRoom")}
            </Button>

            {/* LIVE Mode - Host แชร์หน้าจอ */}
            {onQuickStart && (
              <div className="space-y-1 pt-2 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setShowQuickStartModal(true)}
                  disabled={isLoading}
                >
                  <Zap className="w-5 h-5" />
                  📺 {t("liveMode")}
                </Button>
                <p className="text-white/50 text-xs text-center">
                  {t("liveModeDesc")}
                </p>
              </div>
            )}
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-1">
                {t("createNewRoom")}
              </h2>
              <p className="text-white/60 text-sm">{t("enterNameToStart")}</p>
            </div>

            <Input
              placeholder={t("yourName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center bg-white/10 border-white/20 text-white placeholder:text-white/50"
              maxLength={20}
            />

            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setMode("menu")}
              >
                {t("back")}
              </Button>
              <Button
                variant="default"
                size="lg"
                className="flex-1 bg-white text-black hover:bg-white/90"
                onClick={handleCreate}
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t("createRoom")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-1">
                {t("joinRoom")}
              </h2>
              <p className="text-white/60 text-sm">{t("enterCodeAndName")}</p>
            </div>

            <Input
              placeholder={t("roomCodePlaceholder")}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="text-center text-xl font-mono tracking-widest bg-white/10 border-white/20 text-white placeholder:text-white/50"
              maxLength={6}
            />

            <Input
              placeholder={t("yourName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center bg-white/10 border-white/20 text-white placeholder:text-white/50"
              maxLength={20}
            />

            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setMode("menu")}
              >
                {t("back")}
              </Button>
              <Button
                variant="default"
                size="lg"
                className="flex-1 bg-white text-black hover:bg-white/90"
                onClick={handleJoin}
                disabled={!name.trim() || roomCode.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t("joinRoom")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-white/40 text-sm relative z-10">
        {t("partyMotto")}
      </p>

      {/* Quick Start Modal */}
      <Dialog open={showQuickStartModal} onOpenChange={setShowQuickStartModal}>
        <DialogContent className="sm:max-w-sm bg-black/90 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-white">
              {t("quickStart")}
            </DialogTitle>
            <DialogDescription className="text-center text-white/60">
              {t("quickStartDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="ชื่อของคุณ"
              value={quickStartName}
              onChange={(e) => setQuickStartName(e.target.value)}
              className="text-center bg-white/10 border-white/20 text-white placeholder:text-white/50"
              maxLength={20}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && quickStartName.trim()) {
                  void handleQuickStart();
                }
              }}
            />
            <Button
              variant="default"
              size="lg"
              className="w-full bg-white text-black hover:bg-white/90"
              onClick={handleQuickStart}
              disabled={!quickStartName.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  เริ่มเกม!
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
