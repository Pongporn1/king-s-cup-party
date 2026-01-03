import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import {
  clearAllGameIcons,
  getGameIcons,
  removeGameIcon,
  saveGameIcon,
} from "@/lib/adminStorage";
import { useToast } from "@/hooks/use-toast";

interface Game {
  id: string;
  emoji: string;
  name: string;
  gradient: string;
}

interface GameIconEditorProps {
  games: Game[];
  onClose: () => void;
  onIconsUpdate: () => void;
}

export function GameIconEditor({
  games,
  onClose,
  onIconsUpdate,
}: GameIconEditorProps) {
  const [icons, setIcons] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingGameId, setUploadingGameId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  useEffect(() => {
    const loadIcons = async () => {
      const data = await getGameIcons();
      setIcons(data);
    };
    loadIcons();
  }, []);

  const triggerFile = (gameId: string) =>
    fileInputRefs.current[gameId]?.click();

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleUpload = async (gameId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกรูปภาพ",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: "จำกัด 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingGameId(gameId);
    setIsLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const ok = await saveGameIcon(gameId, base64);
      if (ok) {
        setIcons((prev) => ({ ...prev, [gameId]: base64 }));
        onIconsUpdate();
        toast({
          title: "อัปโหลดสำเร็จ",
          description: `ตั้งไอคอนให้ ${gameId}`,
        });
      } else {
        toast({ title: "บันทึกไม่สำเร็จ", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    } finally {
      setUploadingGameId(null);
      setIsLoading(false);
    }
  };

  const handleRemove = async (gameId: string) => {
    setIsLoading(true);
    const ok = await removeGameIcon(gameId);
    setIsLoading(false);
    if (ok) {
      setIcons((prev) => {
        const next = { ...prev };
        delete next[gameId];
        return next;
      });
      onIconsUpdate();
      toast({ title: "ลบไอคอนแล้ว", description: "กลับไปใช้ค่าเดิม" });
    } else {
      toast({ title: "ลบไม่สำเร็จ", variant: "destructive" });
    }
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    const ok = await clearAllGameIcons();
    setIsLoading(false);
    if (ok) {
      setIcons({});
      onIconsUpdate();
      toast({ title: "รีเซ็ตไอคอนทั้งหมดแล้ว" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-amber-900 to-black w-full max-w-2xl rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden">
        <div className="bg-amber-600/30 px-6 py-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">🖼️ แก้ไขไอคอนเกม</h2>
              <p className="text-amber-200 text-sm">ไอคอนเล็กที่ใช้แทน emoji</p>
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

        <ScrollArea className="h-[60vh]">
          <div className="p-6 space-y-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-black/30 rounded-xl border border-amber-500/20 p-4 flex gap-4 items-center"
              >
                <div
                  className="w-20 h-20 rounded-xl flex-shrink-0 border border-amber-500/30 overflow-hidden"
                  style={{
                    backgroundImage: icons[game.id]
                      ? `url(${icons[game.id]})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!icons[game.id] && (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${game.gradient} flex items-center justify-center text-4xl`}
                    >
                      {game.emoji}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{game.name}</p>
                      <p className="text-xs text-amber-200">ID: {game.id}</p>
                    </div>
                    {icons[game.id] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(game.id)}
                        disabled={isLoading}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> ลบไอคอน
                      </Button>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => (fileInputRefs.current[game.id] = el)}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUpload(game.id, file);
                        e.target.value = "";
                      }
                    }}
                  />

                  <Button
                    size="sm"
                    onClick={() => triggerFile(game.id)}
                    disabled={isLoading}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {uploadingGameId === game.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        กำลังอัปโหลด...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {icons[game.id] ? "เปลี่ยนไอคอน" : "อัปโหลดไอคอน"}
                      </>
                    )}
                  </Button>

                  {icons[game.id] && (
                    <p className="text-xs text-green-400">
                      ✅ ใช้ไอคอนที่กำหนดเอง
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="bg-black/30 px-6 py-4 border-t border-amber-500/30 flex justify-between">
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={isLoading || Object.keys(icons).length === 0}
            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4 mr-2" /> รีเซ็ตทั้งหมด
          </Button>
          <Button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            ปิด
          </Button>
        </div>
      </div>
    </div>
  );
}
