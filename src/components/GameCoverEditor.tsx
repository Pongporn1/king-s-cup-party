import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Trash2,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Link as LinkIcon,
} from "lucide-react";
import {
  getGameCovers,
  saveGameCover,
  removeGameCover,
  clearAllGameCovers,
} from "@/lib/adminStorage";
import { useToast } from "@/hooks/use-toast";

interface Game {
  id: string;
  emoji: string;
  name: string;
  gradient: string;
}

interface GameCoverEditorProps {
  games: Game[];
  onClose: () => void;
  onCoversUpdate: () => void;
}

export function GameCoverEditor({
  games,
  onClose,
  onCoversUpdate,
}: GameCoverEditorProps) {
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load covers on mount
  useEffect(() => {
    const loadCovers = async () => {
      const loadedCovers = await getGameCovers();
      setCovers(loadedCovers);
    };
    loadCovers();
  }, []);

  const handleUrlSave = async (gameId: string) => {
    if (!imageUrl.trim()) {
      toast({
        title: "กรุณาใส่ URL",
        description: "โปรดใส่ลิงก์รูปภาพก่อนบันทึก",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(imageUrl.trim());
    } catch {
      toast({
        title: "URL ไม่ถูกต้อง",
        description:
          "โปรดใส่ลิงก์รูปภาพที่ถูกต้อง เช่น https://example.com/image.jpg",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const success = await saveGameCover(gameId, imageUrl.trim());
    setIsLoading(false);

    if (success) {
      setCovers({ ...covers, [gameId]: imageUrl.trim() });
      setImageUrl("");
      setSelectedGame(null);
      onCoversUpdate();
      toast({
        title: "บันทึกสำเร็จ",
        description: `อัปเดตปกเกม ${
          games.find((g) => g.id === gameId)?.name
        } แล้ว`,
      });
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกปกเกมได้",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCover = async (gameId: string) => {
    setIsLoading(true);
    const success = await removeGameCover(gameId);
    setIsLoading(false);

    if (success) {
      const newCovers = { ...covers };
      delete newCovers[gameId];
      setCovers(newCovers);
      onCoversUpdate();
      toast({
        title: "ลบปกเกมแล้ว",
        description: "กลับไปใช้ปกเริ่มต้น",
      });
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบปกเกมได้",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    const success = await clearAllGameCovers();
    setIsLoading(false);

    if (success) {
      setCovers({});
      onCoversUpdate();
      toast({
        title: "รีเซ็ตทั้งหมดแล้ว",
        description: "กลับไปใช้ปกเริ่มต้นทุกเกม",
      });
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรีเซ็ตปกเกมได้",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-indigo-900 to-black w-full max-w-2xl rounded-2xl border border-indigo-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600/30 px-6 py-4 border-b border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">🎨 แก้ไขปกเกม</h2>
                <p className="text-indigo-300 text-sm">
                  เปลี่ยนรูปภาพปกของแต่ละเกม
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

        {/* Content */}
        <ScrollArea className="h-[60vh]">
          <div className="p-6 space-y-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-black/30 rounded-xl border border-indigo-500/20 p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Cover Preview */}
                  <div
                    className={`w-24 h-32 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${game.gradient}`}
                    style={
                      covers[game.id]
                        ? {
                            backgroundImage: `url(${covers[game.id]})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    {!covers[game.id] && (
                      <span className="text-5xl">{game.emoji}</span>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">
                        {game.name}
                      </h3>
                      {covers[game.id] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCover(game.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          ลบปก
                        </Button>
                      )}
                    </div>

                    {/* URL Input */}
                    {selectedGame === game.id ? (
                      <div className="flex gap-2 animate-fade-in">
                        <Input
                          placeholder="วาง URL รูปภาพ... (เช่น https://example.com/image.jpg)"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUrlSave(game.id);
                            }
                          }}
                          className="flex-1 bg-white/10 border-indigo-500/30 text-white placeholder:text-white/40 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUrlSave(game.id)}
                          disabled={!imageUrl.trim()}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedGame(null);
                            setImageUrl("");
                          }}
                          className="text-white/70 hover:bg-white/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedGame(game.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        ใส่ลิงก์รูปภาพ
                      </Button>
                    )}

                    {covers[game.id] && (
                      <p className="text-xs text-indigo-400">
                        ✅ ใช้ปกที่กำหนดเอง
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="bg-black/30 px-6 py-4 border-t border-indigo-500/30">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="border-red-500/30 text-red-400 hover:bg-red-500/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              รีเซ็ตทั้งหมด
            </Button>
            <Button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              เสร็จสิ้น
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
