import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Save, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import {
  GameProfile,
  getGameProfiles,
  resetGameProfile,
  saveGameProfile,
} from "@/lib/adminStorage";
import { useToast } from "@/hooks/use-toast";

interface Game {
  id: string;
  emoji: string;
  name: string;
  gradient: string;
}

interface GameProfileEditorProps {
  games: Game[];
  onClose: () => void;
  onProfilesUpdate: () => void;
}

export function GameProfileEditor({
  games,
  onClose,
  onProfilesUpdate,
}: GameProfileEditorProps) {
  const [profiles, setProfiles] = useState<Record<string, GameProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoading(true);
      const loaded = await getGameProfiles();
      setProfiles(loaded);
      setIsLoading(false);
    };

    loadProfiles();
  }, []);

  const getDraft = (game: Game) => {
    const override = profiles[game.id];
    return {
      title: override?.title ?? game.name,
      emoji: override?.emoji ?? game.emoji,
      gradient: override?.gradient ?? game.gradient,
    };
  };

  const updateDraft = (game: Game, field: keyof GameProfile, value: string) => {
    setProfiles((prev) => {
      const current = prev[game.id] ?? {
        title: game.name,
        emoji: game.emoji,
        gradient: game.gradient,
      };

      return {
        ...prev,
        [game.id]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const handleSave = async (game: Game) => {
    const draft = getDraft(game);
    setSavingId(game.id);
    setIsLoading(true);
    const success = await saveGameProfile(game.id, {
      title: draft.title,
      emoji: draft.emoji,
      gradient: draft.gradient,
    });
    setIsLoading(false);
    setSavingId(null);

    if (success) {
      onProfilesUpdate();
      toast({
        title: "บันทึกโปรไฟล์แล้ว",
        description: `อัปเดตข้อมูลของ ${game.name}`,
      });
    } else {
      toast({
        title: "บันทึกไม่สำเร็จ",
        description: "ลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  const handleReset = async (game: Game) => {
    setSavingId(game.id);
    setIsLoading(true);
    const success = await resetGameProfile(game.id, {
      title: game.name,
      emoji: game.emoji,
      gradient: game.gradient,
    });
    setIsLoading(false);
    setSavingId(null);

    if (success) {
      setProfiles((prev) => {
        const next = { ...prev };
        delete next[game.id];
        return next;
      });
      onProfilesUpdate();
      toast({
        title: "รีเซ็ตแล้ว",
        description: `กลับไปใช้ค่าเริ่มต้นของ ${game.name}`,
      });
    } else {
      toast({
        title: "รีเซ็ตไม่สำเร็จ",
        description: "ลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-amber-900 to-black w-full max-w-3xl rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden">
        <div className="bg-amber-600/30 px-6 py-4 border-b border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  🛠️ แก้ไขโปรไฟล์เกม
                </h2>
                <p className="text-amber-200 text-sm">
                  ชื่อ อีโมจิ และสีพื้นหลัง
                </p>
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

        <ScrollArea className="h-[65vh]">
          <div className="p-6 space-y-4">
            {games.map((game) => {
              const draft = getDraft(game);
              return (
                <div
                  key={game.id}
                  className="bg-black/30 rounded-xl border border-amber-500/20 p-4"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center text-4xl bg-gradient-to-br ${draft.gradient}`}
                    >
                      <span>{draft.emoji}</span>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">
                          {draft.title}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReset(game)}
                            disabled={isLoading}
                            className="border-red-500/40 text-red-300 hover:bg-red-500/20"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" /> รีเซ็ต
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSave(game)}
                            disabled={isLoading}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            {savingId === game.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                กำลังบันทึก...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" /> บันทึก
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-sm text-white/70">
                            ชื่อเกม
                          </label>
                          <Input
                            value={draft.title}
                            onChange={(e) =>
                              updateDraft(game, "title", e.target.value)
                            }
                            className="bg-white/10 border-amber-500/30 text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm text-white/70">
                            อีโมจิ
                          </label>
                          <Input
                            value={draft.emoji || ""}
                            onChange={(e) =>
                              updateDraft(game, "emoji", e.target.value)
                            }
                            className="bg-white/10 border-amber-500/30 text-white"
                            maxLength={3}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm text-white/70">
                            Gradient class
                          </label>
                          <Input
                            value={draft.gradient || ""}
                            onChange={(e) =>
                              updateDraft(game, "gradient", e.target.value)
                            }
                            className="bg-white/10 border-amber-500/30 text-white"
                            placeholder="from-indigo-500 to-purple-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-amber-100 text-sm">
              💡 ใช้ Tailwind gradient classes เช่น from-amber-500 to-orange-600
            </div>
          </div>
        </ScrollArea>

        <div className="bg-black/30 px-6 py-4 border-t border-amber-500/30 flex justify-end">
          <Button onClick={onClose} className="bg-amber-600 hover:bg-amber-700">
            ปิด
          </Button>
        </div>
      </div>
    </div>
  );
}
