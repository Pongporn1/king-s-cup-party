import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, RefreshCw, Copy, Check } from "lucide-react";
import {
  generateCardRule,
  generateMultipleRules,
  CardRule,
} from "@/lib/aiService";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";

interface AIRuleGeneratorProps {
  playerCount: number;
  onApplyRule?: (cardValue: string, rule: string) => void;
}

export function AIRuleGenerator({
  playerCount,
  onApplyRule,
}: AIRuleGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRules, setGeneratedRules] = useState<CardRule[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleGenerateRules = async () => {
    setIsGenerating(true);
    try {
      const rules = await generateMultipleRules(5, playerCount);
      setGeneratedRules(rules);

      toast({
        title: "✨ สร้างกติกาสำเร็จ!",
        description: `AI สร้างกติกาใหม่ ${rules.length} อัน`,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error ? error.message : "ไม่สามารถสร้างกติกาได้",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSingle = async (
    difficulty: "easy" | "medium" | "hard"
  ) => {
    setIsGenerating(true);
    try {
      const cards = [
        "A",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
      ];
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      const rule = await generateCardRule(randomCard, playerCount, difficulty);
      setGeneratedRules([rule, ...generatedRules]);

      toast({
        title: "✨ สร้างกติกาสำเร็จ!",
        description: `สร้างกติกาสำหรับไพ่ ${rule.card}`,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error ? error.message : "ไม่สามารถสร้างกติกาได้",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyRule = (rule: CardRule, index: number) => {
    navigator.clipboard.writeText(`${rule.card}: ${rule.rule}`);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);

    toast({
      title: "คัดลอกแล้ว!",
      description: "คัดลอกกติกาไปยังคลิปบอร์ดแล้ว",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "ง่าย";
      case "medium":
        return "กลาง";
      case "hard":
        return "ยาก";
      default:
        return difficulty;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI สร้างกติกา
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-gray-900 text-white border-white/20 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-purple-400" />
            AI Rule Generator
          </DialogTitle>
          <DialogDescription className="text-white/60">
            ให้ AI สร้างกติกาไพ่ใหม่ที่สร้างสรรค์และสนุก สำหรับ {playerCount} คน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Quick Generate Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleGenerateRules()}
              disabled={isGenerating}
              className="flex-1 bg-purple-500 hover:bg-purple-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  สร้าง 5 กติกา
                </>
              )}
            </Button>

            {generatedRules.length > 0 && (
              <Button
                onClick={() => setGeneratedRules([])}
                variant="outline"
                className="border-white/20 text-white/70 hover:bg-white/10"
              >
                ล้างทั้งหมด
              </Button>
            )}
          </div>

          {/* Difficulty Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleGenerateSingle("easy")}
              disabled={isGenerating}
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              size="sm"
            >
              + ง่าย
            </Button>
            <Button
              onClick={() => handleGenerateSingle("medium")}
              disabled={isGenerating}
              variant="outline"
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              size="sm"
            >
              + กลาง
            </Button>
            <Button
              onClick={() => handleGenerateSingle("hard")}
              disabled={isGenerating}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              size="sm"
            >
              + ยาก
            </Button>
          </div>

          {/* Generated Rules List */}
          {generatedRules.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/80">
                กติกาที่สร้างแล้ว ({generatedRules.length}):
              </h3>
              {generatedRules.map((rule, index) => (
                <div
                  key={index}
                  className="bg-black/40 backdrop-blur-md rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                        >
                          ไพ่ {rule.card}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getDifficultyColor(rule.difficulty)}
                        >
                          {getDifficultyLabel(rule.difficulty)}
                        </Badge>
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {rule.rule}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleCopyRule(rule, index)}
                      size="sm"
                      variant="ghost"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">กดปุ่มด้านบนเพื่อให้ AI สร้างกติกาใหม่</p>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-4 mt-4">
          <p className="text-xs text-white/40 text-center">
            💡 กติกาที่สร้างเป็นเพียงคำแนะนำ ปรับแต่งได้ตามความเหมาะสม
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
