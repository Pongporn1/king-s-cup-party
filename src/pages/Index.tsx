import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameRoom } from "@/hooks/useGameRoom";
import { usePokDengRoom } from "@/hooks/usePokDengRoom";
import { useUndercoverRoom } from "@/hooks/useUndercoverRoom";
import { useParanoiaGame } from "@/hooks/useParanoiaGame";
import { useFiveSecGame } from "@/hooks/useFiveSecGame";
import { useSessionRecovery } from "@/hooks/useSessionRecovery";
import { Lobby } from "@/components/Lobby";
import { GameRoom } from "@/components/GameRoom";
import { PokDengLobby } from "@/components/PokDengLobby";
import { PokDengGameRoomMultiplayer } from "@/components/PokDengGameRoomMultiplayer";
import { UndercoverLobby } from "@/components/UndercoverLobby";
import { UndercoverGameRoom } from "@/components/UndercoverGameRoom";
import { ParanoiaLobby } from "@/components/ParanoiaLobby";
import { ParanoiaGameRoom } from "@/components/ParanoiaGameRoom";
import { FiveSecLobby } from "@/components/FiveSecLobby";
import { FiveSecGameRoom } from "@/components/FiveSecGameRoom";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ThemedBackground from "@/components/ThemedBackground";
import { FloatingNames, AdminPanel } from "@/components/AdminPanel";
import {
  GameProfile,
  getFloatingNamesFromDB,
  getGameCovers,
  getGameIcons,
  getGameProfiles,
} from "@/lib/adminStorage";
import { t } from "@/lib/i18n";
import { LoginButton } from "@/components/LoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { HeroSection } from "@/components/HeroSection";
import { GameCard } from "@/components/GameCard";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Settings,
  Grid3X3,
  ImageIcon,
  Sparkles,
  Loader2,
} from "lucide-react";

type GameMode =
  | "select"
  | "kingscup"
  | "pokdeng"
  | "undercover"
  | "paranoia"
  | "5-sec"
  | "doraemon";

const Index = () => {
  const { user, displayName: authDisplayName } = useAuth();
  const [gameMode, setGameMode] = useState<GameMode>("select");
  const [floatingNames, setFloatingNames] = useState<string[]>([]);
  const [isPokDengLiveMode, setIsPokDengLiveMode] = useState(false);
  const [isRecoveringSession, setIsRecoveringSession] = useState(true);

  // Session Recovery
  const { sessionData, hasSession, saveSession, clearSession } =
    useSessionRecovery();

  // Admin Panel State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [gameCovers, setGameCovers] = useState<Record<string, string>>({});
  const [gameIcons, setGameIcons] = useState<Record<string, string>>({});
  const [gameProfiles, setGameProfiles] = useState<Record<string, GameProfile>>(
    {}
  );
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // Admin gate: must be logged-in user with displayName "bonne"
  const isHeekbonne = !!user && authDisplayName === "bonne";
  const canShowAdminButton = isHeekbonne;

  // King's Cup game hook
  const {
    room,
    players,
    currentPlayerId,
    isLoading,
    createRoom,
    joinRoom,
    startGame,
    drawCard,
    reshuffleDeck,
    leaveRoom,
    quickStart,
  } = useGameRoom();

  // Pok Deng game hook
  const {
    room: pokDengRoom,
    players: pokDengPlayers,
    currentPlayerId: pokDengCurrentPlayerId,
    isLoading: pokDengIsLoading,
    createRoom: pokDengCreateRoom,
    joinRoom: pokDengJoinRoom,
    startGame: pokDengStartGame,
    drawCard: pokDengDrawCard,
    standCard: pokDengStandCard,
    dealerDraw: pokDengDealerDraw,
    dealerStand: pokDengDealerStand,
    showdown: pokDengShowdown,
    nextRound: pokDengNextRound,
    leaveRoom: pokDengLeaveRoom,
    quickStart: pokDengQuickStart,
    setDealer: pokDengSetDealer,
  } = usePokDengRoom();

  // Undercover game hook
  const {
    room: undercoverRoom,
    players: undercoverPlayers,
    currentPlayerId: undercoverCurrentPlayerId,
    isLoading: undercoverIsLoading,
    categories: undercoverCategories,
    createRoom: undercoverCreateRoom,
    joinRoom: undercoverJoinRoom,
    startGame: undercoverStartGame,
    startDescribePhase: undercoverStartDescribePhase,
    nextTurn: undercoverNextTurn,
    startVoting: undercoverStartVoting,
    votePlayer: undercoverVotePlayer,
    checkResultAndContinue: undercoverCheckResultAndContinue,
    restartGame: undercoverRestartGame,
    leaveRoom: undercoverLeaveRoom,
  } = useUndercoverRoom();

  // Paranoia game hook
  const {
    room: paranoiaRoom,
    players: paranoiaPlayers,
    currentPlayerId: paranoiaCurrentPlayerId,
    isLoading: paranoiaIsLoading,
    questions: paranoiaQuestions,
    createRoom: paranoiaCreateRoom,
    joinRoom: paranoiaJoinRoom,
    startGame: paranoiaStartGame,
    startRound: paranoiaStartRound,
    selectVictim: paranoiaSelectVictim,
    revealQuestion: paranoiaRevealQuestion,
    skipQuestion: paranoiaSkipQuestion,
    leaveRoom: paranoiaLeaveRoom,
  } = useParanoiaGame();

  // 5 Second Rule game hook
  const {
    room: fiveSecRoom,
    players: fiveSecPlayers,
    currentPlayerId: fiveSecCurrentPlayerId,
    isLoading: fiveSecIsLoading,
    createRoom: fiveSecCreateRoom,
    joinRoom: fiveSecJoinRoom,
    startGame: fiveSecStartGame,
    startRound: fiveSecStartRound,
    finishAnswering: fiveSecFinishAnswering,
    vote: fiveSecVote,
    leaveRoom: fiveSecLeaveRoom,
  } = useFiveSecGame();

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const isHost = currentPlayer?.is_host ?? false;

  const pokDengCurrentPlayer = pokDengPlayers.find(
    (p) => p.id === pokDengCurrentPlayerId
  );
  const isPokDengHost = pokDengCurrentPlayer?.is_host ?? false;

  // หน้าเลือกเกม - Nintendo Switch Style with Framer Motion
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);

  // Get current room info for friend invites
  const getCurrentRoomInfo = () => {
    if (room) return { code: room.code, type: "kingscup", name: t("kingsCup") };
    if (pokDengRoom)
      return { code: pokDengRoom.code, type: "pokdeng", name: t("pokDeng") };
    if (undercoverRoom)
      return {
        code: undercoverRoom.code,
        type: "undercover",
        name: t("undercoverTitle"),
      };
    if (paranoiaRoom)
      return { code: paranoiaRoom.code, type: "paranoia", name: "Paranoia" };
    if (fiveSecRoom)
      return { code: fiveSecRoom.code, type: "5-sec", name: "5 Second Rule" };
    return null;
  };

  const currentRoomInfo = getCurrentRoomInfo();

  // Games array - compute each render so translations stay fresh and keys stay unique
  const games = (() => {
    const baseGames = [
      {
        id: "kingscup",
        emoji: "🎴",
        name: t("kingsCup"),
        desc: t("kingsCupDesc"),
        gradient: "from-red-500 to-orange-500",
        bgColor: "#ef4444",
      },
      {
        id: "pokdeng",
        emoji: "🃏",
        name: t("pokDeng"),
        desc: t("pokDengDesc"),
        gradient: "from-emerald-500 to-green-600",
        bgColor: "#10b981",
      },
      {
        id: "undercover",
        emoji: "🕵️",
        name: t("undercoverTitle"),
        desc: t("undercoverDesc"),
        gradient: "from-purple-600 to-indigo-600",
        bgColor: "#9333ea",
      },
      {
        id: "paranoia",
        emoji: "🤫",
        name: "Paranoia",
        desc: "ถามคำถามลับๆ - สายมึน",
        gradient: "from-pink-500 to-rose-600",
        bgColor: "#ec4899",
      },
      {
        id: "5-sec",
        emoji: "⏱️",
        name: "5 Second Rule",
        desc: "ตอบคำถาม 5 วินาที - สายเร็ว",
        gradient: "from-yellow-400 to-orange-500",
        bgColor: "#f59e0b",
      },
      {
        id: "texas-holdem",
        emoji: "♠️",
        name: "Texas Hold'em",
        desc: "โป๊กเกอร์สุดคลาสสิก - เดิมพันสนุก",
        gradient: "from-blue-600 to-cyan-600",
        bgColor: "#2563eb",
        externalLink: "https://pongporn1.github.io/texas-hold-em-power/#/auth",
      },
    ];

    const mergedGames = baseGames.map((game) => {
      const profile = gameProfiles[game.id];
      const iconUrl = gameIcons[game.id];

      return {
        ...game,
        emoji: profile?.emoji ?? game.emoji,
        name: profile?.title || game.name,
        gradient: profile?.gradient || game.gradient,
        iconUrl,
      };
    });

    // Deduplicate by id to avoid key collisions if data is accidentally duplicated upstream
    const seen = new Set<string>();
    const deduplicated = mergedGames.filter((game) => {
      if (seen.has(game.id)) {
        console.warn(`⚠️ Duplicate game ID detected: ${game.id}`);
        return false;
      }
      seen.add(game.id);
      return true;
    });

    return deduplicated;
  })();

  // Navigation functions
  const nextGame = useCallback(() => {
    setSelectedGameIndex((prev) => (prev + 1) % games.length);
  }, [games.length]);

  const prevGame = useCallback(() => {
    setSelectedGameIndex((prev) => (prev - 1 + games.length) % games.length);
  }, [games.length]);

  // Session Recovery Effect - Attempt to rejoin room on page load
  useEffect(() => {
    const attemptRecovery = async () => {
      if (
        !hasSession ||
        !sessionData.roomCode ||
        !sessionData.gameType ||
        !sessionData.playerName
      ) {
        setIsRecoveringSession(false);
        return;
      }

      console.log("Attempting session recovery:", sessionData);

      try {
        const gameType = sessionData.gameType;
        const roomCode = sessionData.roomCode;
        // Use Firebase displayName first, then fallback to session name
        const playerName = authDisplayName || sessionData.playerName;
        const playerId = sessionData.playerId;

        // Set game mode first
        if (
          gameType === "doraemon" ||
          gameType === "pokdeng" ||
          gameType === "undercover" ||
          gameType === "paranoia" ||
          gameType === "5-sec"
        ) {
          setGameMode(gameType);
        }

        // Attempt to rejoin based on game type, passing saved playerId for accurate session recovery
        let success: unknown = false;
        switch (gameType) {
          case "kingscup":
            success = await joinRoom(roomCode, playerName, playerId);
            break;
          case "pokdeng":
            success = await pokDengJoinRoom(roomCode, playerName, playerId);
            break;
          case "undercover":
            success = await undercoverJoinRoom(roomCode, playerName, playerId);
            break;
          case "paranoia":
            success = await paranoiaJoinRoom(roomCode, playerName, playerId);
            break;
          case "5-sec":
            success = await fiveSecJoinRoom(roomCode, playerName, playerId);
            break;
        }

        if (!success) {
          console.log("Session recovery failed, clearing session");
          clearSession();
          setGameMode("select");
        } else {
          console.log("Session recovery successful!");
        }
      } catch (error) {
        console.error("Session recovery error:", error);
        clearSession();
        setGameMode("select");
      } finally {
        setIsRecoveringSession(false);
      }
    };

    attemptRecovery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSession]); // Only run once when hasSession is determined

  // Wrapper functions to save session when creating/joining rooms
  const handleCreateRoom = useCallback(
    async (hostName: string, gameType: GameMode) => {
      let result;
      switch (gameType) {
        case "kingscup":
          result = await createRoom(hostName);
          break;
        case "pokdeng":
          result = await pokDengCreateRoom(hostName);
          break;
        case "undercover":
          result = await undercoverCreateRoom(hostName);
          break;
        case "paranoia":
          result = await paranoiaCreateRoom(hostName);
          break;
        case "5-sec":
          result = await fiveSecCreateRoom(hostName);
          break;
      }

      if (result) {
        // Extract roomCode and playerId from result
        const roomCode =
          typeof result === "string"
            ? result
            : result.code || (result as { code?: string }).code;
        const playerId =
          typeof result === "object" && result !== null && "playerId" in result
            ? (result as { playerId: string }).playerId
            : undefined;

        saveSession({
          playerName: hostName,
          roomCode,
          gameType,
          playerId,
        });
      }
      return result;
    },
    [
      createRoom,
      pokDengCreateRoom,
      undercoverCreateRoom,
      paranoiaCreateRoom,
      fiveSecCreateRoom,
      saveSession,
    ]
  );

  const handleJoinRoom = useCallback(
    async (code: string, playerName: string, gameType: GameMode) => {
      let result: unknown = null;
      switch (gameType) {
        case "kingscup":
          result = await joinRoom(code, playerName);
          break;
        case "pokdeng":
          result = await pokDengJoinRoom(code, playerName);
          break;
        case "undercover":
          result = await undercoverJoinRoom(code, playerName);
          break;
        case "paranoia":
          result = await paranoiaJoinRoom(code, playerName);
          break;
        case "5-sec":
          result = await fiveSecJoinRoom(code, playerName);
          break;
      }

      if (result) {
        // Extract playerId from result if available
        const playerId =
          typeof result === "object" && result !== null && "playerId" in result
            ? (result as { playerId: string }).playerId
            : undefined;

        saveSession({
          playerName,
          roomCode: code.toUpperCase(),
          gameType,
          playerId,
        });
      }
      return !!result;
    },
    [
      joinRoom,
      pokDengJoinRoom,
      undercoverJoinRoom,
      paranoiaJoinRoom,
      fiveSecJoinRoom,
      saveSession,
    ]
  );

  // Handle joining room from friend invite
  const handleJoinFromInvite = useCallback(
    async (roomCode: string, gameType: string) => {
      // Use Firebase displayName first, fallback to localStorage
      const savedName =
        authDisplayName ||
        localStorage.getItem("playerName") ||
        `Player_${Math.random().toString(36).slice(2, 6)}`;

      // Map game type to our game mode
      const gameTypeMap: Record<string, GameMode> = {
        kingscup: "kingscup",
        doraemon: "kingscup",
        pokdeng: "pokdeng",
        undercover: "undercover",
        paranoia: "paranoia",
        "5-sec": "5-sec",
      };

      const targetGameMode = gameTypeMap[gameType] || "kingscup";
      setGameMode(targetGameMode);

      // Join the room
      const success = await handleJoinRoom(roomCode, savedName, targetGameMode);
      if (!success) {
        setGameMode("select");
      }
    },
    [handleJoinRoom, authDisplayName]
  );

  const handleLeaveRoom = useCallback(
    (gameType: GameMode) => {
      clearSession();
      switch (gameType) {
        case "kingscup":
          leaveRoom();
          break;
        case "pokdeng":
          pokDengLeaveRoom();
          break;
        case "undercover":
          undercoverLeaveRoom();
          break;
        case "paranoia":
          paranoiaLeaveRoom();
          break;
        case "5-sec":
          fiveSecLeaveRoom();
          break;
      }
      setGameMode("select");
    },
    [
      clearSession,
      leaveRoom,
      pokDengLeaveRoom,
      undercoverLeaveRoom,
      paranoiaLeaveRoom,
      fiveSecLeaveRoom,
    ]
  );

  // Load floating names, game covers, and profiles
  useEffect(() => {
    const loadNames = async () => {
      const names = await getFloatingNamesFromDB();
      setFloatingNames(names);
    };

    const loadCovers = async () => {
      const covers = await getGameCovers();
      setGameCovers(covers);
    };

    const loadIcons = async () => {
      const icons = await getGameIcons();
      setGameIcons(icons);
    };

    const loadProfiles = async () => {
      const profiles = await getGameProfiles();
      setGameProfiles(profiles);
    };

    loadNames();
    loadCovers();
    loadIcons();
    loadProfiles();
  }, [gameMode, showAdminPanel]);

  // Restore admin unlock from previous session (per-uid)
  useEffect(() => {
    const stored = user?.uid ? localStorage.getItem("admin_unlock_code") : null;

    if (stored && user?.uid && stored === "1" + user.uid) {
      setIsAdminUnlocked(true);
      return;
    }

    // Auto-unlock for bonne to skip the prompt
    if (isHeekbonne && user?.uid) {
      localStorage.setItem("admin_unlock_code", "1" + user.uid);
      setIsAdminUnlocked(true);
    }
  }, [user?.uid, authDisplayName, isHeekbonne]);

  // Keyboard Navigation (Arrow keys like Nintendo Switch)
  useEffect(() => {
    if (gameMode !== "select") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextGame();
      if (e.key === "ArrowLeft") prevGame();
      if (e.key === "Enter") {
        const selectedGame = games[selectedGameIndex];
        setGameMode(selectedGame.id as GameMode);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameMode, selectedGameIndex, nextGame, prevGame, games]);

  // Show loading screen during session recovery
  if (isRecoveringSession) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-zinc-900 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
        <p className="text-white text-xl font-medium">กำลังกลับเข้าห้อง...</p>
        <p className="text-zinc-400 text-sm">Recovering session...</p>
      </div>
    );
  }

  if (gameMode === "select") {
    return (
      <div className="min-h-screen min-h-[100dvh] relative overflow-hidden bg-zinc-900 text-white flex">
        {/* Themed Background */}
        <ThemedBackground />

        {/* Floating Names */}
        <FloatingNames names={floatingNames} />

        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Hidden LoginButton for mobile - triggered by Profile button */}
        <div className="hidden">
          <LoginButton
            currentRoomCode={currentRoomInfo?.code}
            currentGameType={currentRoomInfo?.type}
            currentGameName={currentRoomInfo?.name}
            onJoinRoom={handleJoinFromInvite}
          />
        </div>

        {/* Main Content with padding for sidebar (desktop) and bottom nav (mobile) */}
        <div className="flex-1 md:pl-20 pb-20 md:pb-0">
          {/* Header Bar */}
          <div className="fixed top-0 left-0 md:left-20 right-0 z-[70] flex items-center justify-between px-4 md:px-6 py-3 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-base md:text-lg shadow-lg">
                🎮
              </div>
              <span className="text-base md:text-xl font-bold">
                King's Cup Party
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:block">
                <LoginButton
                  currentRoomCode={currentRoomInfo?.code}
                  currentGameType={currentRoomInfo?.type}
                  currentGameName={currentRoomInfo?.name}
                  onJoinRoom={handleJoinFromInvite}
                />
              </div>
              <LanguageSwitcher />
              <ThemeSwitcher />
              <span className="hidden md:block text-zinc-400 text-sm">
                {new Date().toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Hero Section uses selected game profile (no cover) */}
          <HeroSection
            title={games[selectedGameIndex].name}
            description={games[selectedGameIndex].desc}
            emoji={games[selectedGameIndex].emoji}
            iconUrl={games[selectedGameIndex].iconUrl}
            gradient={games[selectedGameIndex].gradient}
          />

          {/* Games Section with PS5-Style */}
          <div
            id="games-section"
            className="relative min-h-screen flex flex-col"
          >
            {/* Large Background Image */}
            <motion.div
              key={`bg-${games[selectedGameIndex].id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-cover bg-center bg-gradient-to-br from-slate-900 via-slate-800 to-black"
              style={
                gameCovers[games[selectedGameIndex].id]
                  ? {
                      backgroundImage: `url(${
                        gameCovers[games[selectedGameIndex].id]
                      })`,
                    }
                  : undefined
              }
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            {/* Game Icons Row (Top) */}
            <div className="relative z-20 px-2 md:px-8 pt-16 md:pt-28 pb-4 md:pb-8 overflow-visible">
              <div className="flex items-center gap-2 md:gap-6 overflow-x-auto overflow-y-visible scrollbar-hide py-2 md:py-8 px-1 md:px-4">
                {games.map((game, index) => {
                  const isActive = index === selectedGameIndex;
                  return (
                    <motion.button
                      key={`game-${game.id}-${index}`}
                      onClick={() => setSelectedGameIndex(index)}
                      className="flex-shrink-0 relative"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={
                        isActive ? { scale: 1.1, y: 0 } : { scale: 0.95, y: 0 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    >
                      <div
                        className={`w-16 h-16 md:w-28 md:h-28 rounded-lg md:rounded-2xl overflow-hidden transition-all duration-300 ${
                          isActive
                            ? "ring-2 md:ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.5)] md:shadow-[0_0_30px_rgba(255,255,255,0.6)] brightness-110"
                            : "ring-1 md:ring-2 ring-white/20 opacity-50 hover:opacity-90"
                        }`}
                      >
                        {game.iconUrl ? (
                          <img
                            src={game.iconUrl}
                            alt={game.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full bg-gradient-to-br ${game.gradient} flex items-center justify-center text-3xl md:text-5xl`}
                          >
                            {game.emoji}
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="gameIndicator"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -bottom-3 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full shadow-lg"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Game Info (Bottom Left) */}
            <motion.div
              key={`info-${games[selectedGameIndex].id}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-20 mt-auto px-4 md:px-12 pb-24 md:pb-16 max-w-2xl"
            >
              <h1 className="text-3xl md:text-6xl font-black text-white mb-2 md:mb-4 drop-shadow-2xl">
                {games[selectedGameIndex].name}
              </h1>
              <p className="text-sm md:text-xl text-white/90 mb-4 md:mb-8 drop-shadow-lg line-clamp-2 md:line-clamp-none">
                {games[selectedGameIndex].desc}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 md:gap-4">
                <motion.button
                  onClick={() => {
                    const selectedGame = games[selectedGameIndex];
                    if (selectedGame.externalLink) {
                      window.location.href = selectedGame.externalLink;
                    } else {
                      setGameMode(selectedGame.id as GameMode);
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 md:px-12 py-2.5 md:py-4 bg-white/90 hover:bg-white text-black rounded-full font-bold text-sm md:text-lg shadow-2xl flex items-center gap-1.5 md:gap-3"
                >
                  <Play className="w-4 h-4 md:w-6 md:h-6 fill-black" />
                  Play
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 md:p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full border border-white/30"
                >
                  <span className="text-lg md:text-2xl">⋯</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Admin Button (floating) - requires allowlisted uid + env code */}
          {canShowAdminButton && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isHeekbonne) {
                  setShowAdminPanel(true);
                  return;
                }

                // Only authorized users can access admin panel
                alert(
                  "❌ คุณไม่มีสิทธิ์เข้าถึง Admin Panel\n\nกรุณาเปลี่ยนชื่อเป็น 'bonne' เพื่อเข้าใช้งาน"
                );
              }}
              className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 p-3 md:p-4 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/30"
            >
              <Settings className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          )}
        </div>

        {/* Admin Panel Modal */}
        {showAdminPanel && (
          <AdminPanel
            onClose={() => setShowAdminPanel(false)}
            games={games}
            onCoversUpdate={async () => {
              const covers = await getGameCovers();
              setGameCovers(covers);
            }}
            onProfilesUpdate={async () => {
              const profiles = await getGameProfiles();
              setGameProfiles(profiles);
            }}
            onIconsUpdate={async () => {
              const icons = await getGameIcons();
              setGameIcons(icons);
            }}
          />
        )}
      </div>
    );
  }

  // ไพ่ป๊อกเด้ง Multiplayer
  if (gameMode === "pokdeng") {
    // ยังไม่ได้เข้าห้อง - แสดง Lobby
    if (!pokDengRoom) {
      return (
        <PokDengLobby
          onCreateRoom={async (name) => {
            const result = await handleCreateRoom(name, "pokdeng");
            return result;
          }}
          onJoinRoom={async (code, name) => {
            return handleJoinRoom(code, name, "pokdeng");
          }}
          onQuickStart={async (name) => {
            setIsPokDengLiveMode(true);
            const result = await pokDengQuickStart(name, true);
            if (result) {
              const roomCode =
                typeof result === "string" ? result : result.code;
              saveSession({
                playerName: name,
                roomCode,
                gameType: "pokdeng",
              });
            }
            return result;
          }}
          isLoading={pokDengIsLoading}
          onBack={() => setGameMode("select")}
        />
      );
    }

    // เข้าห้องแล้ว - แสดง Game Room
    return (
      <PokDengGameRoomMultiplayer
        room={pokDengRoom}
        players={pokDengPlayers}
        currentPlayerId={pokDengCurrentPlayerId}
        isHost={isPokDengHost}
        isLiveMode={isPokDengLiveMode}
        onStartGame={pokDengStartGame}
        onDrawCard={pokDengDrawCard}
        onStandCard={pokDengStandCard}
        onDealerDraw={pokDengDealerDraw}
        onDealerStand={pokDengDealerStand}
        onShowdown={pokDengShowdown}
        onNextRound={pokDengNextRound}
        onLeave={() => {
          setIsPokDengLiveMode(false);
          handleLeaveRoom("pokdeng");
        }}
        onSetDealer={pokDengSetDealer}
      />
    );
  }

  // Undercover
  if (gameMode === "undercover") {
    // ยังไม่ได้เข้าห้อง - แสดง Lobby
    if (!undercoverRoom) {
      return (
        <UndercoverLobby
          onCreateRoom={async (name) => {
            return handleCreateRoom(name, "undercover");
          }}
          onJoinRoom={async (code, name) => {
            return handleJoinRoom(code, name, "undercover");
          }}
          onBack={() => setGameMode("select")}
          isLoading={undercoverIsLoading}
        />
      );
    }

    // เข้าห้องแล้ว - แสดง Game Room
    const isHost =
      undercoverPlayers.find((p) => p.id === undercoverCurrentPlayerId)
        ?.is_host || false;

    return (
      <UndercoverGameRoom
        room={undercoverRoom}
        players={undercoverPlayers}
        currentPlayerId={undercoverCurrentPlayerId}
        isHost={isHost}
        categories={undercoverCategories}
        onStartGame={undercoverStartGame}
        onRestartGame={undercoverRestartGame}
        onLeave={() => handleLeaveRoom("undercover")}
      />
    );
  }

  // Paranoia
  if (gameMode === "paranoia") {
    if (!paranoiaRoom) {
      return (
        <ParanoiaLobby
          onCreateRoom={async (name) => {
            return handleCreateRoom(name, "paranoia");
          }}
          onJoinRoom={async (code, name) => {
            return handleJoinRoom(code, name, "paranoia");
          }}
          onBack={() => setGameMode("select")}
          isLoading={paranoiaIsLoading}
        />
      );
    }
    const isHost =
      paranoiaPlayers.find((p) => p.id === paranoiaCurrentPlayerId)?.is_host ||
      false;
    return (
      <ParanoiaGameRoom
        room={paranoiaRoom}
        players={paranoiaPlayers}
        currentPlayerId={paranoiaCurrentPlayerId}
        isHost={isHost}
        totalQuestions={paranoiaQuestions.length}
        onStartGame={paranoiaStartGame}
        onStartRound={paranoiaStartRound}
        onSelectVictim={paranoiaSelectVictim}
        onRevealQuestion={paranoiaRevealQuestion}
        onSkipQuestion={paranoiaSkipQuestion}
        onLeave={() => handleLeaveRoom("paranoia")}
      />
    );
  }

  // 5 Second Rule
  if (gameMode === "5-sec") {
    if (!fiveSecRoom) {
      return (
        <FiveSecLobby
          onCreateRoom={async (name) => {
            return handleCreateRoom(name, "5-sec");
          }}
          onJoinRoom={async (code, name) => {
            return handleJoinRoom(code, name, "5-sec");
          }}
          onBack={() => setGameMode("select")}
          isLoading={fiveSecIsLoading}
        />
      );
    }
    const isHost =
      fiveSecPlayers.find((p) => p.id === fiveSecCurrentPlayerId)?.is_host ||
      false;
    return (
      <FiveSecGameRoom
        room={fiveSecRoom}
        players={fiveSecPlayers}
        currentPlayerId={fiveSecCurrentPlayerId}
        isHost={isHost}
        onStartGame={fiveSecStartGame}
        onStartRound={fiveSecStartRound}
        onFinishAnswering={fiveSecFinishAnswering}
        onVote={fiveSecVote}
        onLeave={() => handleLeaveRoom("5-sec")}
      />
    );
  }

  // ไพ่โดเรม่อน (เกมเดิม)
  if (!room) {
    return (
      <Lobby
        onCreateRoom={async (name) => {
          return handleCreateRoom(name, "kingscup");
        }}
        onJoinRoom={async (code, name) => {
          return handleJoinRoom(code, name, "kingscup");
        }}
        onQuickStart={async (name) => {
          const result = await quickStart(name);
          if (result) {
            const roomCode = typeof result === "string" ? result : result.code;
            saveSession({
              playerName: name,
              roomCode,
              gameType: "kingscup",
            });
          }
          return result;
        }}
        isLoading={isLoading}
        onBack={() => setGameMode("select")}
      />
    );
  }

  return (
    <GameRoom
      room={room}
      players={players}
      currentPlayerId={currentPlayerId}
      isHost={isHost}
      onStartGame={startGame}
      onDrawCard={drawCard}
      onReshuffle={reshuffleDeck}
      onLeave={() => handleLeaveRoom("kingscup")}
    />
  );
};

export default Index;
