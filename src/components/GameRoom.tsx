import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlayingCard } from "@/components/PlayingCard";
import { WaitingForPlayersAnimation } from "@/components/WaitingForPlayersAnimation";
import { PlayerList } from "@/components/PlayerList";
import { CardDeck } from "@/components/CardDeck";
import { RuleEditor } from "@/components/RuleEditor";
import { useCustomRules } from "@/hooks/useCustomRules";
import { PlayingCard as CardType, CARD_RULES, CardRule } from "@/lib/cardRules";
import { Copy, LogOut, Play, RefreshCw, Spade } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface Room {
  id: string;
  code: string;
  host_name: string;
  is_active: boolean;
  deck: CardType[];
  current_card: CardType | null;
  cards_remaining: number;
  game_started: boolean;
}
interface Player {
  id: string;
  room_id: string;
  name: string;
  is_host: boolean;
  is_active: boolean;
}
interface GameRoomProps {
  room: Room;
  players: Player[];
  currentPlayerId: string | null;
  isHost: boolean;
  onStartGame: () => void;
  onDrawCard: () => void;
  onReshuffle: () => void;
  onLeave: () => void;
}
export function GameRoom({
  room,
  players,
  currentPlayerId,
  isHost,
  onStartGame,
  onDrawCard,
  onReshuffle,
  onLeave,
}: GameRoomProps) {
  const { toast } = useToast();
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const ruleBoxRef = useRef<HTMLDivElement>(null);
  const { customRules } = useCustomRules(room.code);

  // Use custom rules or default
  const activeRules = customRules;

  const copyRoomCode = async () => {
    const code = room.code;
    let copied = false;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        copied = true;
      }
    } catch (err) {
      // Clipboard API failed
    }

    if (!copied) {
      try {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand("copy");
        document.body.removeChild(textArea);
        copied = result;
      } catch (err) {
        // execCommand failed
      }
    }

    // Always show toast with the code so user can see it
    toast({
      title: copied ? "✅ คัดลอกแล้ว!" : "📋 รหัสห้อง",
      description: code,
      duration: 5000,
    });
  };

  const handleDeckTap = () => {
    if (room.cards_remaining === 0) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;

    // If tapped within 500ms, count as consecutive tap
    if (timeSinceLastTap < 500 && tapCount > 0) {
      const newTapCount = tapCount + 1;
      setTapCount(newTapCount);
      setLastTapTime(now);

      if (newTapCount >= 3 && isHost) {
        // 3 taps = reshuffle
        setTapCount(0);
        onReshuffle();
        toast({
          title: "🃏 สับไพ่ใหม่แล้ว!",
          description: "ไพ่ถูกสับใหม่ทั้งสำรับ",
        });
        return;
      }
    } else {
      // First tap or tap after timeout - draw card
      setTapCount(1);
      setLastTapTime(now);
      handleDrawCard();
    }
  };

  const handleDrawCard = () => {
    if (room.cards_remaining === 0) return;
    setIsCardFlipped(false);
    setTimeout(() => {
      onDrawCard();
      setTimeout(() => {
        setIsCardFlipped(true);
        // Auto scroll to rule box after card flip
        setTimeout(() => {
          ruleBoxRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300);
      }, 300);
    }, 200);
  };
  const gameOver = room.cards_remaining === 0 && room.current_card !== null;
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col p-2 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-105"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}bg-game.jpg')`,
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Header - compact on mobile */}
      <header className="flex items-center justify-between mb-2 sm:mb-4 relative z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLeave}
            className="text-white/70 hover:text-red-400 hover:bg-red-400/10 w-8 h-8 sm:w-10 sm:h-10"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-white text-sm sm:text-lg">
              🍻 ไพ่โดเรม่อน
            </h1>
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-1 text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
            >
              <span className="font-mono bg-white/10 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm">
                {room.code}
              </span>
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHost && <RuleEditor roomCode={room.code} isHost={isHost} />}
          {isHost && room.game_started && !gameOver && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onReshuffle();
                toast({
                  title: "🃏 สับไพ่ใหม่แล้ว!",
                  description: "ไพ่ถูกสับใหม่ทั้งสำรับ",
                });
              }}
              className="text-white/70 hover:text-amber-400 hover:bg-amber-400/10 w-8 h-8 sm:w-10 sm:h-10"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}
          {isHost && !room.game_started && (
            <Button
              variant="default"
              onClick={onStartGame}
              disabled={players.length < 2}
              className="bg-white text-black hover:bg-white/90 text-xs sm:text-sm px-3 sm:px-4"
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">เริ่มเกม</span>
              <span className="sm:hidden">เริ่ม</span>
            </Button>
          )}
        </div>
      </header>

      {/* Player List */}
      <div className="mb-2 sm:mb-4">
        <PlayerList
          players={players}
          currentPlayerId={currentPlayerId ?? undefined}
        />
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6 md:py-8 relative z-10">
        {!room.game_started ? (
          <div className="text-center px-2">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 sm:p-8 mb-4 sm:mb-6 border border-white/10">
              <WaitingForPlayersAnimation />
              <p className="text-white/60 text-xs sm:text-sm mt-2">
                {isHost
                  ? 'แชร์รหัสห้องให้เพื่อนๆ แล้วกด "เริ่มเกม"'
                  : "รอ Host เริ่มเกม"}
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 sm:p-5 inline-block border border-white/10">
              <p className="text-xs text-white/50 mb-1 sm:mb-2">รหัสห้อง</p>
              <button
                onClick={copyRoomCode}
                className="font-mono text-3xl sm:text-4xl font-bold text-white tracking-widest hover:opacity-80 transition-opacity"
              >
                {room.code}
              </button>
            </div>
          </div>
        ) : gameOver ? (
          <div className="text-center px-2">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                จบเกม!
              </h2>
              <p className="text-white/60 mb-4 sm:mb-6 text-base sm:text-lg">
                ไพ่หมดแล้ว ยินดีด้วย!
              </p>
              {isHost && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={onReshuffle}
                  className="bg-white text-black hover:bg-white/90"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  เล่นรอบใหม่
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center w-full px-2 sm:px-4">
            {/* HOST VIEW - Display screen only (like a TV) */}
            {isHost ? (
              <div className="flex flex-col items-center justify-center w-full">
                {/* Large Card Display for Host */}
                {room.current_card ? (
                  <div className="flex flex-col items-center">
                    <PlayingCard
                      card={room.current_card}
                      isFlipped={true}
                      showRule={false}
                      size="large"
                    />
                    {/* Rule Box - large for display */}
                    <div className="mt-6 sm:mt-8 bg-black/60 backdrop-blur-md rounded-2xl px-6 py-4 sm:px-8 sm:py-6 border border-white/10 max-w-md">
                      <div className="flex items-center gap-4 sm:gap-5">
                        <span className="text-4xl sm:text-5xl md:text-6xl">
                          {activeRules[room.current_card.value]?.emoji || "🃏"}
                        </span>
                        <div>
                          <h3 className="text-amber-400 font-bold text-lg sm:text-xl md:text-2xl">
                            {activeRules[room.current_card.value]?.title}
                          </h3>
                          <p className="text-white/80 text-sm sm:text-base md:text-lg">
                            {activeRules[room.current_card.value]?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-72 sm:w-56 sm:h-80 md:w-64 md:h-96 flex items-center justify-center bg-black/30 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/20">
                      <WaitingForPlayersAnimation />
                    </div>
                    <div className="mt-6 bg-black/40 backdrop-blur-md rounded-xl px-6 py-4 border border-white/10">
                      <p className="text-white/50 text-xs sm:text-sm text-center">
                        หน้าจอนี้แสดงไพ่ให้ทุกคนดู
                        <br />
                        ผู้เล่นใช้มือถือกดจั่วไพ่ได้เลย
                      </p>
                    </div>
                  </div>
                )}

                {/* Cards remaining indicator */}
                <div className="mt-6 bg-black/40 backdrop-blur-md rounded-full px-6 py-2 border border-white/10">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {room.cards_remaining}
                  </span>
                  <span className="text-white/60 ml-2">ใบ</span>
                </div>
              </div>
            ) : (
              /* PLAYER VIEW - Can draw cards */
              <>
                {/* Cards Area - side by side: Card | Deck */}
                <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-12">
                  {/* Current Card on left */}
                  {room.current_card ? (
                    <PlayingCard
                      card={room.current_card}
                      isFlipped={isCardFlipped}
                      showRule={false}
                    />
                  ) : (
                    <div className="w-32 h-48 sm:w-44 sm:h-64 flex items-center justify-center bg-black/30 backdrop-blur-md rounded-xl border-2 border-dashed border-white/20">
                      <p className="text-white/50 text-xs sm:text-sm text-center px-2">
                        กดกองไพ่
                        <br />
                        เพื่อจั่ว
                      </p>
                    </div>
                  )}

                  {/* Card Deck on right - clickable */}
                  <CardDeck
                    cardsRemaining={room.cards_remaining}
                    onDraw={handleDeckTap}
                    disabled={room.cards_remaining === 0}
                    showCount={true}
                  />
                </div>

                {/* Rule Box - shown below cards */}
                {room.current_card && isCardFlipped && (
                  <div
                    ref={ruleBoxRef}
                    className="mt-4 sm:mt-6 bg-black/60 backdrop-blur-md rounded-xl px-5 py-3 sm:px-6 sm:py-4 border border-white/10 max-w-sm"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-3xl sm:text-4xl">
                        {activeRules[room.current_card.value]?.emoji || "🃏"}
                      </span>
                      <div>
                        <h3 className="text-amber-400 font-bold text-sm sm:text-base">
                          {activeRules[room.current_card.value]?.title}
                        </h3>
                        <p className="text-white/80 text-xs sm:text-sm">
                          {activeRules[room.current_card.value]?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
