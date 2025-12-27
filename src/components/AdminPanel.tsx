import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, Trash2, LogOut, Users, Loader2 } from "lucide-react";
import {
  getFloatingNamesFromDB,
  addFloatingName,
  removeFloatingName,
  clearAllFloatingNames,
} from "@/lib/adminStorage";

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [names, setNames] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load names from Supabase on mount
  useEffect(() => {
    loadNames();
  }, []);

  const loadNames = async () => {
    setIsLoading(true);
    const fetchedNames = await getFloatingNamesFromDB();
    setNames(fetchedNames);
    setIsLoading(false);
  };

  const addName = async () => {
    if (!newName.trim()) return;
    const trimmedName = newName.trim();
    setNewName("");

    // Optimistic update
    setNames((prev) => [...prev, trimmedName]);

    await addFloatingName(trimmedName);
  };

  const removeName = async (index: number) => {
    const nameToRemove = names[index];

    // Optimistic update
    setNames((prev) => prev.filter((_, i) => i !== index));

    await removeFloatingName(nameToRemove);
  };

  const clearAll = async () => {
    setNames([]);
    await clearAllFloatingNames();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900 to-black w-full max-w-md rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-purple-600/30 px-6 py-4 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">🔐 Admin Panel</h2>
                <p className="text-purple-300 text-sm">ยินดีต้อนรับ BONNE</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-white/60 text-sm">
              เพิ่มชื่อเพื่อนเพื่อให้ลอยบนหน้า Lobby
            </p>
          </div>

          {/* Add name input */}
          <div className="flex gap-2">
            <Input
              placeholder="ชื่อเพื่อน..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addName()}
              className="flex-1 bg-white/10 border-purple-500/30 text-white placeholder:text-white/40"
              maxLength={20}
            />
            <Button
              onClick={addName}
              disabled={!newName.trim()}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Names list */}
          <ScrollArea className="h-48 rounded-lg bg-black/30 border border-purple-500/20">
            <div className="p-3 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              ) : names.length === 0 ? (
                <p className="text-center text-white/40 text-sm py-8">
                  ยังไม่มีชื่อเพื่อน
                </p>
              ) : (
                names.map((name, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30"
                  >
                    <span className="text-white font-medium">{name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeName(index)}
                      className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={clearAll}
              disabled={names.length === 0}
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              ลบทั้งหมด
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ปิด
            </Button>
          </div>

          {/* Stats */}
          <div className="text-center pt-2 border-t border-purple-500/20">
            <p className="text-purple-300 text-sm">
              จำนวนชื่อทั้งหมด:{" "}
              <span className="font-bold text-white">{names.length}</span> คน
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating names component for Lobby - DVD screensaver style
interface FloatingNamesProps {
  names: string[];
}

interface FloatingName {
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  glow: string;
}

const COLORS = [
  { gradient: "from-pink-500 to-purple-500", glow: "#ec4899" },
  { gradient: "from-blue-500 to-cyan-500", glow: "#3b82f6" },
  { gradient: "from-green-500 to-emerald-500", glow: "#22c55e" },
  { gradient: "from-yellow-500 to-orange-500", glow: "#eab308" },
  { gradient: "from-red-500 to-pink-500", glow: "#ef4444" },
  { gradient: "from-indigo-500 to-purple-500", glow: "#6366f1" },
  { gradient: "from-teal-500 to-blue-500", glow: "#14b8a6" },
  { gradient: "from-amber-500 to-yellow-500", glow: "#f59e0b" },
  { gradient: "from-violet-500 to-fuchsia-500", glow: "#8b5cf6" },
  { gradient: "from-lime-500 to-green-500", glow: "#84cc16" },
];

export function FloatingNames({ names }: FloatingNamesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [floatingItems, setFloatingItems] = useState<FloatingName[]>([]);
  const animationRef = useRef<number>();

  // Initialize floating items
  useEffect(() => {
    if (names.length === 0) {
      setFloatingItems([]);
      return;
    }

    const items: FloatingName[] = names.map((name, index) => {
      const colorObj = COLORS[index % COLORS.length];
      return {
        name,
        x: Math.random() * 60 + 10, // 10-70% from left
        y: Math.random() * 60 + 10, // 10-70% from top
        vx: (Math.random() - 0.5) * 0.2, // Slower random velocity
        vy: (Math.random() - 0.5) * 0.2,
        color: colorObj.gradient,
        glow: colorObj.glow,
      };
    });

    setFloatingItems(items);
  }, [names]);

  // Animation loop
  useEffect(() => {
    if (floatingItems.length === 0) return;

    const animate = () => {
      setFloatingItems((prev) =>
        prev.map((item) => {
          let { x, y, vx, vy } = item;

          // Update position
          x += vx;
          y += vy;

          // Bounce off walls - go to edge of screen
          if (x <= 0 || x >= 95) {
            vx = -vx;
            x = x <= 0 ? 0 : 95;
          }
          if (y <= 0 || y >= 95) {
            vy = -vy;
            y = y <= 0 ? 0 : 95;
          }

          return { ...item, x, y, vx, vy };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [floatingItems.length]);

  if (names.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[5] overflow-hidden"
    >
      {floatingItems.map((item, index) => (
        <div
          key={index}
          className="absolute transition-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
          }}
        >
          <span
            className={`text-xs sm:text-sm font-semibold bg-gradient-to-r ${
              index === 0
                ? "from-yellow-400 via-amber-500 to-yellow-600"
                : item.color
            } bg-clip-text text-transparent whitespace-nowrap`}
            style={{
              filter: `drop-shadow(0 0 6px ${
                index === 0 ? "#fbbf24" : item.glow
              }) drop-shadow(0 0 12px ${
                index === 0 ? "#fbbf2460" : item.glow + "40"
              })`,
            }}
          >
            {index === 0 && "👑 "}
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}
