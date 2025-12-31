import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Trash2,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  Loader2,
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
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingGameId, setUploadingGameId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  // Load covers on mount
  useEffect(() => {
    const loadCovers = async () => {
      const loadedCovers = await getGameCovers();
      setCovers(loadedCovers);
    };
    loadCovers();
  }, []);

  // Convert file to base64 with compression
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas to compress image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Calculate new dimensions (max 800x1200 for game covers)
          let width = img.width;
          let height = img.height;
          const maxWidth = 800;
          const maxHeight = 1200;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with quality 0.85 (85% quality)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload
  const handleFileUpload = async (gameId: string, file: File) => {
    console.log(`🔍 Uploading ${file.name} for ${gameId}`, {
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2) + " MB",
    });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: `ไฟล์ ${file.name} ไม่ใช่รูปภาพ`,
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB - increased limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: `ไฟล์มีขนาด ${sizeMB} MB (จำกัด 10 MB)`,
        variant: "destructive",
      });
      return;
    }

    setUploadingGameId(gameId);
    setIsLoading(true);

    try {
      console.log(`📦 Converting ${file.name} to base64...`);
      // Convert to base64
      const base64 = await fileToBase64(file);
      console.log(`✅ Base64 size: ${(base64.length / 1024).toFixed(2)} KB`);

      // Save to storage
      console.log(`💾 Saving to storage...`);
      const success = await saveGameCover(gameId, base64);

      if (success) {
        console.log(`✅ Saved successfully!`);
        const newCovers = { ...covers, [gameId]: base64 };
        setCovers(newCovers);
        onCoversUpdate();
        toast({
          title: "อัปโหลดสำเร็จ! ✅",
          description: `อัปเดตปกเกม ${
            games.find((g) => g.id === gameId)?.name
          } แล้ว`,
        });
      } else {
        console.error(`❌ Save failed`);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถบันทึกปกเกมได้ ลองใหม่อีกครั้ง",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error ? error.message : "ไม่สามารถอัปโหลดรูปภาพได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadingGameId(null);
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

  const triggerFileInput = (gameId: string) => {
    fileInputRefs.current[gameId]?.click();
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
                          disabled={isLoading}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          ลบปก
                        </Button>
                      )}
                    </div>

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => (fileInputRefs.current[game.id] = el)}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(game.id, file);
                          e.target.value = ""; // Reset for same file selection
                        }
                      }}
                    />

                    {/* Upload Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => triggerFileInput(game.id)}
                      disabled={isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
                    >
                      {uploadingGameId === game.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          กำลังอัปโหลด...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {covers[game.id] ? "เปลี่ยนรูปภาพ" : "อัปโหลดรูปภาพ"}
                        </>
                      )}
                    </Button>

                    {covers[game.id] && (
                      <p className="text-xs text-green-400">
                        ✅ ใช้ปกที่กำหนดเอง
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Instructions */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
              <p className="text-indigo-300 text-sm">
                💡 <strong>คำแนะนำ:</strong> เลือกไฟล์รูปภาพจากเครื่อง (JPG,
                PNG, GIF, WEBP) ขนาดไม่เกิน 10MB
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="bg-black/30 px-6 py-4 border-t border-indigo-500/30">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={isLoading || Object.keys(covers).length === 0}
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
