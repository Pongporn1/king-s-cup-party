import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Plus,
  Trash2,
  LogOut,
  Users,
  Loader2,
  ImageIcon,
} from "lucide-react";
import {
  getFloatingNamesFromDB,
  addFloatingName,
  removeFloatingName,
  clearAllFloatingNames,
} from "@/lib/adminStorage";
import { GameCoverEditor } from "./GameCoverEditor";

interface AdminPanelProps {
  onClose: () => void;
  games?: Array<{
    id: string;
    emoji: string;
    name: string;
    gradient: string;
  }>;
  onCoversUpdate?: () => void;
}

export function AdminPanel({
  onClose,
  games = [],
  onCoversUpdate,
}: AdminPanelProps) {
  const [names, setNames] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCoverEditor, setShowCoverEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<"names" | "covers">("names");

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

  if (showCoverEditor && games.length > 0) {
    return (
      <GameCoverEditor
        games={games}
        onClose={() => setShowCoverEditor(false)}
        onCoversUpdate={() => {
          setShowCoverEditor(false);
          onCoversUpdate?.();
        }}
      />
    );
  }

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

        {/* Tabs */}
        <div className="bg-black/20 px-6 py-3 border-b border-purple-500/20 flex gap-2">
          <Button
            variant={activeTab === "names" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("names")}
            className={
              activeTab === "names"
                ? "bg-purple-600 text-white"
                : "text-purple-300 hover:text-white hover:bg-purple-600/20"
            }
          >
            <Users className="w-4 h-4 mr-2" />
            ชื่อลอย
          </Button>
          <Button
            variant={activeTab === "covers" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("covers")}
            className={
              activeTab === "covers"
                ? "bg-purple-600 text-white"
                : "text-purple-300 hover:text-white hover:bg-purple-600/20"
            }
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            ปกเกม
          </Button>
        </div>

        {/* Content */}
        {activeTab === "names" ? (
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
        ) : (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-white/60 text-sm mb-4">
                แก้ไขรูปภาพปกของแต่ละเกม
              </p>
            </div>

            <Button
              onClick={() => setShowCoverEditor(true)}
              disabled={games.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              เปิดตัวแก้ไขปกเกม
            </Button>

            {games.length === 0 && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                <p className="text-yellow-300 text-sm">
                  ⚠️ ไม่พบข้อมูลเกม กรุณาเปิด Admin Panel จากหน้าเลือกเกม
                </p>
              </div>
            )}

            <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
              <p className="text-white/60 text-sm">
                💡 <strong>วิธีใช้:</strong> ใส่ลิงก์รูปภาพจากอินเทอร์เน็ต
                (คลิกขวาที่รูป → คัดลอกที่อยู่รูปภาพ)
              </p>
            </div>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              ปิด
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// FloatingNames Component - แสดงชื่อที่ลอยบนหน้าจอแบบ DVD

interface FloatingNamesProps {
  names: string[];
}

const DVD_COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#ffe66d",
  "#a8e6cf",
  "#ff8b94",
  "#c7ceea",
  "#b5ead7",
  "#ffd3b6",
  "#dcedc1",
  "#a0d2eb",
  "#d4a5a5",
  "#ffaaa5",
  "#ffc6ff",
  "#9bf6ff",
  "#caffbf",
  "#fdffb6",
  "#bdb2ff",
  "#ffc6ff",
  "#a0c4ff",
  "#ffadad",
];

export function FloatingNames({ names }: FloatingNamesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      element: HTMLDivElement | null;
    }>
  >([]);
  const animationRef = useRef<number>();

  // Initialize positions and velocities
  useEffect(() => {
    if (names.length === 0) return;

    const usedColors = new Set<string>();
    namesRef.current = names.map((_, index) => {
      // สุ่มสีที่ไม่ซ้ำกัน
      let color = DVD_COLORS[index % DVD_COLORS.length];
      let attempts = 0;
      while (usedColors.has(color) && attempts < DVD_COLORS.length) {
        color = DVD_COLORS[(index + attempts) % DVD_COLORS.length];
        attempts++;
      }
      usedColors.add(color);

      return {
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 30),
        vx: (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5),
        vy: (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5),
        color,
        element: null,
      };
    });
  }, [names]);

  // Animation loop
  const animate = useCallback(() => {
    namesRef.current.forEach((item) => {
      if (!item.element) return;

      // Update position
      item.x += item.vx;
      item.y += item.vy;

      // Bounce off edges
      const rect = item.element.getBoundingClientRect();
      if (item.x <= 0 || item.x + rect.width >= window.innerWidth) {
        item.vx *= -1;
        item.x = Math.max(0, Math.min(item.x, window.innerWidth - rect.width));
        // เปลี่ยนสีเมื่อชนขอบ
        const newColor =
          DVD_COLORS[Math.floor(Math.random() * DVD_COLORS.length)];
        item.color = newColor;
        item.element.style.color = newColor;
        item.element.style.textShadow = `0 0 10px ${newColor}, 0 0 20px ${newColor}, 0 0 30px ${newColor}`;
      }
      if (item.y <= 0 || item.y + rect.height >= window.innerHeight) {
        item.vy *= -1;
        item.y = Math.max(
          0,
          Math.min(item.y, window.innerHeight - rect.height)
        );
        // เปลี่ยนสีเมื่อชนขอบ
        const newColor =
          DVD_COLORS[Math.floor(Math.random() * DVD_COLORS.length)];
        item.color = newColor;
        item.element.style.color = newColor;
        item.element.style.textShadow = `0 0 10px ${newColor}, 0 0 20px ${newColor}, 0 0 30px ${newColor}`;
      }

      // Apply position
      item.element.style.transform = `translate(${item.x}px, ${item.y}px)`;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (names.length === 0) return;

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [names, animate]);

  if (names.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {names.map((name, index) => (
        <div
          key={index}
          ref={(el) => {
            if (namesRef.current[index]) {
              namesRef.current[index].element = el;
            }
          }}
          className="fixed text-sm font-bold pointer-events-none whitespace-nowrap"
          style={{
            color:
              namesRef.current[index]?.color ||
              DVD_COLORS[index % DVD_COLORS.length],
            filter: "brightness(1.2) saturate(1.3)",
            textShadow: `0 0 8px ${
              namesRef.current[index]?.color ||
              DVD_COLORS[index % DVD_COLORS.length]
            }, 0 0 15px ${
              namesRef.current[index]?.color ||
              DVD_COLORS[index % DVD_COLORS.length]
            }, 0 0 25px ${
              namesRef.current[index]?.color ||
              DVD_COLORS[index % DVD_COLORS.length]
            }`,
            left: 0,
            top: 0,
            willChange: "transform",
          }}
        >
          {index === 0 && "👑 "}
          {name}
        </div>
      ))}
    </div>
  );
}
