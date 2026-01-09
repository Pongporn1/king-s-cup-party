import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Users,
  UserPlus,
  Send,
  Gamepad2,
  LogOut,
} from "lucide-react";

// All games are now external links
type GameMode = "select";

const Index = () => {
  const { user, displayName: authDisplayName } = useAuth();
  const [gameMode, setGameMode] = useState<GameMode>("select");
  const [floatingNames, setFloatingNames] = useState<string[]>([]);

  // Navigation state for mobile app single view
  const [currentTab, setCurrentTab] = useState<
    "home" | "games" | "friends" | "settings"
  >("home");

  // Friends tab state
  const [friendsTab, setFriendsTab] = useState<
    "friends" | "requests" | "search"
  >("friends");

  // Diving transition state
  const [isDiving, setIsDiving] = useState(false);
  const [diveComplete, setDiveComplete] = useState(false);

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

  // All game hooks removed - games are now external links

  // หน้าเลือกเกม - Nintendo Switch Style with Framer Motion
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);

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
        externalLink: "https://your-kingscup-url.vercel.app", // 👈 TODO: Deploy and update
      },
      {
        id: "pokdeng",
        emoji: "🃏",
        name: t("pokDeng"),
        desc: t("pokDengDesc"),
        gradient: "from-emerald-500 to-green-600",
        bgColor: "#10b981",
        externalLink: "https://your-pokdeng-url.vercel.app", // 👈 TODO: Deploy and update
      },
      {
        id: "undercover",
        emoji: "🕵️",
        name: t("undercoverTitle"),
        desc: t("undercoverDesc"),
        gradient: "from-purple-600 to-indigo-600",
        bgColor: "#9333ea",
        externalLink: "https://your-undercover-url.vercel.app", // 👈 TODO: Deploy and update
      },
      {
        id: "paranoia",
        emoji: "🤫",
        name: "Paranoia",
        desc: "ถามคำถามลับๆ - สายมึน",
        gradient: "from-pink-500 to-rose-600",
        bgColor: "#ec4899",
        externalLink: "https://your-paranoia-url.vercel.app", // 👈 TODO: Deploy and update
      },
      {
        id: "5-sec",
        emoji: "⏱️",
        name: "5 Second Rule",
        desc: "ตอบคำถาม 5 วินาที - สายเร็ว",
        gradient: "from-yellow-400 to-orange-500",
        bgColor: "#f59e0b",
        externalLink: "https://your-5sec-url.vercel.app", // 👈 TODO: Deploy and update
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

  // Session recovery removed - all games are external now

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
        // All games are external links now
        if (selectedGame.externalLink) {
          window.open(selectedGame.externalLink, "_blank");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameMode, selectedGameIndex, nextGame, prevGame, games]);

  if (gameMode === "select") {
    return (
      <div className="min-h-screen min-h-[100dvh] relative overflow-hidden bg-zinc-900 text-white flex">
        {/* Diving Animation Overlay */}
        <AnimatePresence>
          {isDiving && (
            <motion.div
              className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Deep ocean background */}
              <motion.div
                className="absolute inset-0"
                initial={{
                  background:
                    "radial-gradient(ellipse at 50% 0%, rgba(0,150,200,0.3) 0%, rgba(0,50,80,0.95) 40%, rgba(0,20,40,1) 100%)",
                }}
                animate={{
                  background: diveComplete
                    ? "radial-gradient(ellipse at 50% -50%, rgba(100,200,255,0.4) 0%, rgba(0,80,120,0.6) 30%, transparent 60%)"
                    : "radial-gradient(ellipse at 50% -20%, rgba(0,180,220,0.4) 0%, rgba(0,40,80,0.98) 50%, rgba(0,10,30,1) 100%)",
                }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />

              {/* Underwater caustics/light patterns */}
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse 80% 50% at 20% 30%, rgba(0,200,255,0.3) 0%, transparent 50%),
                    radial-gradient(ellipse 60% 40% at 70% 20%, rgba(0,180,220,0.25) 0%, transparent 50%),
                    radial-gradient(ellipse 100% 60% at 50% 10%, rgba(100,220,255,0.2) 0%, transparent 60%)
                  `,
                }}
                animate={{
                  opacity: diveComplete ? [0.3, 0.6, 0.8] : [0, 0.3, 0.2],
                  scale: diveComplete ? [1, 1.1, 1] : [1.2, 1, 0.9],
                }}
                transition={{ duration: 2, ease: "easeOut" }}
              />

              {/* Floating particles/plankton */}
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: Math.random() * 4 + 1,
                    height: Math.random() * 4 + 1,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    background: `rgba(${150 + Math.random() * 100}, ${
                      200 + Math.random() * 55
                    }, 255, ${0.3 + Math.random() * 0.4})`,
                    boxShadow: `0 0 ${
                      Math.random() * 6 + 2
                    }px rgba(100, 200, 255, 0.5)`,
                  }}
                  animate={{
                    y: diveComplete
                      ? [0, -50, -100]
                      : [0, Math.random() * 100 - 50],
                    x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
                    opacity: diveComplete
                      ? [0.6, 0.8, 0]
                      : [0, 0.6, 0.4, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    delay: Math.random() * 1,
                    ease: "easeInOut",
                    repeat: diveComplete ? 0 : Infinity,
                    repeatType: "reverse",
                  }}
                />
              ))}

              {/* Fish silhouettes swimming */}
              {[...Array(12)].map((_, i) => {
                const fishSize = 20 + Math.random() * 40;
                const startLeft = Math.random() > 0.5;
                const yPos = 10 + Math.random() * 70;
                return (
                  <motion.div
                    key={`fish-${i}`}
                    className="absolute"
                    style={{
                      left: startLeft ? "-10%" : "110%",
                      top: `${yPos}%`,
                      width: fishSize,
                      height: fishSize * 0.5,
                      filter: "blur(1px)",
                    }}
                    initial={{ x: 0, opacity: 0 }}
                    animate={{
                      x: startLeft
                        ? window.innerWidth * 1.3
                        : -window.innerWidth * 1.3,
                      y: [
                        0,
                        Math.random() * 30 - 15,
                        Math.random() * 20 - 10,
                        0,
                      ],
                      opacity: [0, 0.4, 0.5, 0.3, 0],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      delay: Math.random() * 2,
                      ease: "linear",
                    }}
                  >
                    {/* Fish body SVG silhouette */}
                    <svg
                      viewBox="0 0 100 50"
                      className="w-full h-full"
                      style={{
                        transform: startLeft ? "scaleX(1)" : "scaleX(-1)",
                      }}
                    >
                      <path
                        d="M10,25 Q30,10 50,25 Q70,10 85,25 L95,15 L95,35 L85,25 Q70,40 50,25 Q30,40 10,25 Z"
                        fill="rgba(0,30,50,0.6)"
                      />
                      <circle
                        cx="20"
                        cy="23"
                        r="3"
                        fill="rgba(100,200,255,0.3)"
                      />
                    </svg>
                  </motion.div>
                );
              })}

              {/* School of small fish */}
              {[...Array(8)].map((_, groupIndex) => {
                const groupY = 20 + Math.random() * 50;
                const groupDelay = Math.random() * 3;
                return (
                  <motion.div
                    key={`fish-school-${groupIndex}`}
                    className="absolute"
                    style={{
                      left: "-15%",
                      top: `${groupY}%`,
                    }}
                    initial={{ x: 0 }}
                    animate={{
                      x: window.innerWidth * 1.4,
                      y: [0, 20, -10, 15, 0],
                    }}
                    transition={{
                      duration: 6 + Math.random() * 2,
                      delay: groupDelay,
                      ease: "linear",
                    }}
                  >
                    {/* Small fish in group */}
                    {[...Array(5)].map((_, fishIndex) => (
                      <motion.div
                        key={`small-fish-${groupIndex}-${fishIndex}`}
                        className="absolute"
                        style={{
                          left: fishIndex * 15,
                          top: (fishIndex % 2) * 12 - 6,
                          width: 12 + Math.random() * 8,
                          height: 8,
                        }}
                        animate={{
                          y: [0, 3, -2, 1, 0],
                        }}
                        transition={{
                          duration: 1 + Math.random() * 0.5,
                          repeat: Infinity,
                          delay: fishIndex * 0.1,
                        }}
                      >
                        <svg viewBox="0 0 24 12" className="w-full h-full">
                          <path
                            d="M2,6 Q8,2 14,6 L22,3 L22,9 L14,6 Q8,10 2,6 Z"
                            fill="rgba(0,40,60,0.5)"
                          />
                        </svg>
                      </motion.div>
                    ))}
                  </motion.div>
                );
              })}

              {/* Seaweed from bottom */}
              {[...Array(10)].map((_, i) => {
                const seaweedHeight = 100 + Math.random() * 150;
                const xPos = 5 + i * 10 + Math.random() * 5;
                return (
                  <motion.div
                    key={`seaweed-${i}`}
                    className="absolute bottom-0"
                    style={{
                      left: `${xPos}%`,
                      width: 20 + Math.random() * 15,
                      height: seaweedHeight,
                      transformOrigin: "bottom center",
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                      opacity: diveComplete ? [0.5, 0.3, 0] : [0, 0.5, 0.6],
                      y: diveComplete ? 100 : 0,
                    }}
                    transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                  >
                    {/* Seaweed SVG with wave animation */}
                    <svg viewBox="0 0 30 200" className="w-full h-full">
                      <motion.path
                        d="M15,200 Q5,150 15,100 Q25,50 15,0"
                        fill="none"
                        stroke="rgba(0,80,60,0.6)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        animate={{
                          d: [
                            "M15,200 Q5,150 15,100 Q25,50 15,0",
                            "M15,200 Q25,150 15,100 Q5,50 15,0",
                            "M15,200 Q5,150 15,100 Q25,50 15,0",
                          ],
                        }}
                        transition={{
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      {/* Seaweed leaves */}
                      {[...Array(4)].map((_, leafIndex) => {
                        const initialCx = leafIndex % 2 === 0 ? 7 : 23;
                        const midCx = leafIndex % 2 === 0 ? 12 : 18;
                        return (
                          <motion.ellipse
                            key={`leaf-${i}-${leafIndex}`}
                            cx={initialCx}
                            cy={40 + leafIndex * 40}
                            rx={12}
                            ry={6}
                            fill="rgba(0,100,70,0.5)"
                            animate={{
                              cx: [initialCx, midCx, initialCx],
                            }}
                            transition={{
                              duration: 2 + Math.random(),
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: leafIndex * 0.2,
                            }}
                          />
                        );
                      })}
                    </svg>
                  </motion.div>
                );
              })}

              {/* Jellyfish silhouettes */}
              {[...Array(3)].map((_, i) => {
                const jellyfishSize = 40 + Math.random() * 30;
                return (
                  <motion.div
                    key={`jellyfish-${i}`}
                    className="absolute"
                    style={{
                      left: `${20 + i * 25 + Math.random() * 10}%`,
                      top: `${30 + Math.random() * 30}%`,
                      width: jellyfishSize,
                      height: jellyfishSize * 1.5,
                      filter: "blur(1px)",
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                      opacity: diveComplete
                        ? [0.4, 0.2, 0]
                        : [0, 0.3, 0.4, 0.3],
                      y: diveComplete ? -100 : [0, -20, 0, -15, 0],
                    }}
                    transition={{
                      duration: diveComplete ? 1 : 4 + Math.random() * 2,
                      delay: 0.8 + i * 0.3,
                      repeat: diveComplete ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <svg viewBox="0 0 60 90" className="w-full h-full">
                      {/* Jellyfish bell */}
                      <ellipse
                        cx="30"
                        cy="20"
                        rx="25"
                        ry="18"
                        fill="rgba(100,150,200,0.3)"
                      />
                      <ellipse
                        cx="30"
                        cy="20"
                        rx="20"
                        ry="14"
                        fill="rgba(150,200,255,0.2)"
                      />
                      {/* Tentacles */}
                      {[...Array(5)].map((_, t) => (
                        <motion.path
                          key={`tentacle-${i}-${t}`}
                          d={`M${15 + t * 8},35 Q${10 + t * 8},55 ${
                            15 + t * 8
                          },75 Q${20 + t * 8},85 ${15 + t * 8},90`}
                          fill="none"
                          stroke="rgba(100,180,220,0.3)"
                          strokeWidth="2"
                          animate={{
                            d: [
                              `M${15 + t * 8},35 Q${10 + t * 8},55 ${
                                15 + t * 8
                              },75 Q${20 + t * 8},85 ${15 + t * 8},90`,
                              `M${15 + t * 8},35 Q${20 + t * 8},55 ${
                                15 + t * 8
                              },75 Q${10 + t * 8},85 ${15 + t * 8},90`,
                              `M${15 + t * 8},35 Q${10 + t * 8},55 ${
                                15 + t * 8
                              },75 Q${20 + t * 8},85 ${15 + t * 8},90`,
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: t * 0.1,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </svg>
                  </motion.div>
                );
              })}

              {/* Large bubbles */}
              {[...Array(15)].map((_, i) => {
                const size = Math.random() * 30 + 15;
                return (
                  <motion.div
                    key={`bubble-${i}`}
                    className="absolute rounded-full"
                    style={{
                      width: size,
                      height: size,
                      left: `${Math.random() * 100}%`,
                      bottom: `-${size}px`,
                      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(150,220,255,0.2) 50%, transparent 70%)`,
                      border: `1px solid rgba(255,255,255,0.3)`,
                    }}
                    animate={{
                      y: -window.innerHeight - 100,
                      x: [0, Math.random() * 50 - 25, Math.random() * 30 - 15],
                      scale: [1, 1.1, 0.9, 1.05, 1],
                    }}
                    transition={{
                      duration: 2.5 + Math.random() * 2,
                      delay: Math.random() * 1.5,
                      ease: "easeOut",
                    }}
                  />
                );
              })}

              {/* Small bubble trails */}
              {[...Array(30)].map((_, i) => {
                const size = Math.random() * 8 + 3;
                return (
                  <motion.div
                    key={`small-bubble-${i}`}
                    className="absolute rounded-full bg-white/30"
                    style={{
                      width: size,
                      height: size,
                      left: `${Math.random() * 100}%`,
                      bottom: `-${size}px`,
                    }}
                    animate={{
                      y: -window.innerHeight * 1.2,
                      opacity: [0, 0.5, 0.3, 0],
                    }}
                    transition={{
                      duration: 1.5 + Math.random() * 2,
                      delay: Math.random() * 2,
                      ease: "easeOut",
                    }}
                  />
                );
              })}

              {/* God rays / Light shafts from surface */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`ray-${i}`}
                  className="absolute top-0"
                  style={{
                    width: 60 + Math.random() * 120,
                    height: "150%",
                    left: `${5 + i * 12}%`,
                    background: `linear-gradient(to bottom, rgba(100,220,255,0.4) 0%, rgba(50,180,220,0.15) 30%, transparent 70%)`,
                    transformOrigin: "top center",
                    transform: `rotate(${-20 + Math.random() * 40}deg)`,
                    filter: "blur(8px)",
                  }}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{
                    opacity: diveComplete
                      ? [0.5, 0.7, 0.3]
                      : [0, 0.3, 0.5, 0.2],
                    scaleY: [0, 1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: 0.2 + i * 0.15,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Central light vortex effect */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: diveComplete ? 1 : 0.6 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <motion.div
                  className="relative"
                  animate={{
                    scale: diveComplete ? [1, 1.5, 2] : [0.5, 1, 1.2],
                    opacity: diveComplete ? [0.8, 0.5, 0] : [0, 0.4, 0.6],
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  {/* Ripple rings */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={`ring-${i}`}
                      className="absolute rounded-full border-2 border-cyan-400/30"
                      style={{
                        width: 100 + i * 80,
                        height: 100 + i * 80,
                        left: -(50 + i * 40),
                        top: -(50 + i * 40),
                      }}
                      animate={{
                        scale: [1, 1.3, 1.5],
                        opacity: [0.5, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.3,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>

              {/* Depth pressure vignette */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 30%, rgba(0,10,30,0.8) 100%)",
                }}
                animate={{
                  opacity: diveComplete ? [1, 0.3, 0] : [0, 0.7, 1],
                }}
                transition={{ duration: 1.5 }}
              />

              {/* Surface water effect when emerging */}
              {diveComplete && (
                <>
                  {/* Water surface distortion */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-40"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(100,200,255,0.5) 0%, rgba(50,150,200,0.3) 40%, transparent 100%)",
                    }}
                    initial={{ y: -150, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />

                  {/* Splash droplets */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={`droplet-${i}`}
                      className="absolute rounded-full bg-cyan-300/60"
                      style={{
                        width: Math.random() * 8 + 3,
                        height: Math.random() * 12 + 5,
                        left: `${30 + Math.random() * 40}%`,
                        top: 0,
                      }}
                      initial={{ y: 0, opacity: 1 }}
                      animate={{
                        y: [0, 100 + Math.random() * 150],
                        x: [0, (Math.random() - 0.5) * 100],
                        opacity: [1, 0.5, 0],
                        scale: [1, 0.5],
                      }}
                      transition={{
                        duration: 0.8 + Math.random() * 0.5,
                        delay: Math.random() * 0.3,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}

              {/* Screen flash on surface break */}
              {diveComplete && (
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Themed Background */}
        <ThemedBackground />

        {/* Floating Names */}
        <FloatingNames names={floatingNames} />

        {/* Sidebar Navigation */}
        <Sidebar
          onNavigate={(section) =>
            setCurrentTab(section as "home" | "games" | "friends" | "settings")
          }
          currentSection={currentTab}
        />

        {/* Hidden LoginButton for mobile - triggered by Profile button */}
        <div className="hidden">
          <LoginButton />
        </div>

        {/* Main App Container - Single View (h-screen, no scroll) */}
        <div className="h-screen w-screen overflow-hidden md:pl-20">
          {/* Header Bar */}
          <div className="fixed top-0 left-0 md:left-20 right-0 z-[70] flex items-center justify-between px-4 md:px-6 py-3 md:py-3 pt-safe bg-black/20 backdrop-blur-sm">
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
                <LoginButton />
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

          {/* Content Area - Scrollable per view, with bottom padding for mobile nav */}
          <div className="h-full pt-14 pb-20 md:pb-0 overflow-y-auto">
            {/* Home View */}
            {currentTab === "home" && (
              <div className="h-full overflow-y-auto">
                <HeroSection
                  title={games[selectedGameIndex].name}
                  description={games[selectedGameIndex].desc}
                  emoji={games[selectedGameIndex].emoji}
                  iconUrl={games[selectedGameIndex].iconUrl}
                  gradient={games[selectedGameIndex].gradient}
                  onStartPlaying={() => {
                    setIsDiving(true);
                    // After diving animation, switch to games tab
                    setTimeout(() => {
                      setDiveComplete(true);
                      setCurrentTab("games");
                      // Reset after transition
                      setTimeout(() => {
                        setIsDiving(false);
                        setDiveComplete(false);
                      }, 1000);
                    }, 2000);
                  }}
                />
              </div>
            )}

            {/* Games View */}
            {currentTab === "games" && (
              <div className="absolute inset-0 flex flex-col">
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
                <div className="relative z-20 px-2 md:px-8 pt-24 md:pt-28 pb-4 md:pb-8 overflow-visible">
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
                            isActive
                              ? { scale: 1.1, y: 0 }
                              : { scale: 0.95, y: 0 }
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
                  className="relative z-20 mt-auto px-4 md:px-12 pb-32 md:pb-16 max-w-2xl"
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
            )}

            {/* Friends View */}
            {currentTab === "friends" && (
              <div className="h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto p-2 md:p-4">
                  {/* Header - Reduced margin */}
                  <div className="mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      เพื่อน
                    </h1>
                    <p className="text-zinc-400">
                      จัดการเพื่อนและเชิญเล่นเกมส์
                    </p>
                  </div>

                  {/* Tab Navigation - Working */}
                  <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFriendsTab("friends")}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        friendsTab === "friends"
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      เพื่อน
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFriendsTab("requests")}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        friendsTab === "requests"
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      คำขอ
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFriendsTab("search")}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        friendsTab === "search"
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      ค้นหา
                    </motion.button>
                  </div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    {friendsTab === "friends" && (
                      <motion.div
                        key="friends"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Empty State */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 text-center"
                        >
                          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                            <Users className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                            ยังไม่มีเพื่อน
                          </h3>
                          <p className="text-zinc-400 mb-6 max-w-md mx-auto text-sm md:text-base">
                            เริ่มเชิญเพื่อนของคุณเพื่อเล่นเกมส์ด้วยกัน!
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFriendsTab("search")}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/30 transition-all inline-flex items-center gap-2"
                          >
                            <UserPlus className="w-5 h-5" />
                            เพิ่มเพื่อน
                          </motion.button>
                        </motion.div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 cursor-pointer"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Send className="w-5 h-5 text-purple-400" />
                              </div>
                              <h4 className="font-semibold text-white">
                                เชิญเพื่อน
                              </h4>
                            </div>
                            <p className="text-sm text-zinc-400">
                              แชร์โค้ดห้องเกมส์ให้เพื่อนเพื่อเล่นด้วยกัน
                            </p>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/20 cursor-pointer"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                              </div>
                              <h4 className="font-semibold text-white">
                                เล่นด้วยกัน
                              </h4>
                            </div>
                            <p className="text-sm text-zinc-400">
                              สร้างห้องเกมส์และเชิญเพื่อนเข้าร่วม
                            </p>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {friendsTab === "requests" && (
                      <motion.div
                        key="requests"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 text-center"
                      >
                        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                          <Users className="w-10 h-10 md:w-12 md:h-12 text-purple-400" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                          ไม่มีคำขอ
                        </h3>
                        <p className="text-zinc-400 text-sm md:text-base">
                          ยังไม่มีคำขอเป็นเพื่อนในขณะนี้
                        </p>
                      </motion.div>
                    )}

                    {friendsTab === "search" && (
                      <motion.div
                        key="search"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10"
                      >
                        <div className="text-center mb-6">
                          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                            <UserPlus className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                            ค้นหาเพื่อน
                          </h3>
                          <p className="text-zinc-400 mb-6 text-sm md:text-base">
                            กรุณาเข้าสู่ระบบเพื่อเพิ่มเพื่อน
                          </p>
                          <LoginButton />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Settings View */}
            {currentTab === "settings" && (
              <div className="h-full overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl md:text-4xl font-bold mb-6">
                    Settings
                  </h1>
                  <div className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                      <h3 className="text-xl font-semibold mb-4">Appearance</h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/80">Theme</span>
                        <ThemeSwitcher />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Language</span>
                        <LanguageSwitcher />
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                      <h3 className="text-xl font-semibold mb-4">Account</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80">
                            {authDisplayName || "Guest"}
                          </p>
                          <p className="text-white/40 text-sm">
                            {user ? "Logged in" : "Not logged in"}
                          </p>
                        </div>
                        <LoginButton />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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

  // All games removed - they are now external links
  return <div>Unknown game mode</div>;
};

export default Index;
