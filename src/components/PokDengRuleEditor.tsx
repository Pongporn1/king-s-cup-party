import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PokDengRules {
  pok9Multiplier: number;
  pok8Multiplier: number;
  tongMultiplier: number;
  samLeungMultiplier: number;
  straightMultiplier: number;
  flushMultiplier: number;
  dengMultiplier: number;
  pairMultiplier: number;
}

const DEFAULT_RULES: PokDengRules = {
  pok9Multiplier: 2,
  pok8Multiplier: 2,
  tongMultiplier: 5,
  samLeungMultiplier: 3,
  straightMultiplier: 3,
  flushMultiplier: 3,
  dengMultiplier: 2,
  pairMultiplier: 2,
};

interface PokDengRuleEditorProps {
  roomCode: string;
  isHost: boolean;
}

export function PokDengRuleEditor({
  roomCode,
  isHost,
}: PokDengRuleEditorProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [rules, setRules] = useState<PokDengRules>(DEFAULT_RULES);

  // Load rules from localStorage
  useEffect(() => {
    const savedRules = localStorage.getItem(`pokdeng_rules_${roomCode}`);
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
  }, [roomCode]);

  const handleSave = () => {
    localStorage.setItem(`pokdeng_rules_${roomCode}`, JSON.stringify(rules));
    setIsOpen(false);
    toast({
      title: "✅ บันทึกกติกาสำเร็จ!",
      description: "กติกาใหม่จะใช้ในเกมนี้",
    });
  };

  const handleReset = () => {
    setRules(DEFAULT_RULES);
    localStorage.removeItem(`pokdeng_rules_${roomCode}`);
    toast({
      title: "🔄 รีเซ็ตกติกาแล้ว",
      description: "กลับไปใช้กติกาเริ่มต้น",
    });
  };

  const updateMultiplier = (field: keyof PokDengRules, value: number) => {
    setRules((prev) => ({
      ...prev,
      [field]: Math.max(1, Math.min(10, value)), // จำกัด 1-10 เท่า
    }));
  };

  if (!isHost) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/70 hover:text-amber-400 hover:bg-amber-400/10 w-8 h-8 sm:w-10 sm:h-10"
          title="แก้ไขกติกา"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] bg-gray-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            ⚙️ แก้ไขกติกาป๊อกเด้ง
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {/* ป๊อก 9 */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-amber-400 font-bold flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  ป๊อก 9
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={rules.pok9Multiplier}
                    onChange={(e) =>
                      updateMultiplier(
                        "pok9Multiplier",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 text-center bg-black/30 border-white/20"
                  />
                  <span className="text-white/60">เท่า</span>
                </div>
              </div>
              <p className="text-xs text-white/50">ไพ่ 2 ใบรวมได้ 9 แต้ม</p>
            </div>

            {/* ป๊อก 8 */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-amber-400 font-bold flex items-center gap-2">
                  <span className="text-2xl">🎲</span>
                  ป๊อก 8
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={rules.pok8Multiplier}
                    onChange={(e) =>
                      updateMultiplier(
                        "pok8Multiplier",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 text-center bg-black/30 border-white/20"
                  />
                  <span className="text-white/60">เท่า</span>
                </div>
              </div>
              <p className="text-xs text-white/50">ไพ่ 2 ใบรวมได้ 8 แต้ม</p>
            </div>

            {/* ไพ่ตอง */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-amber-400 font-bold flex items-center gap-2">
                  <span className="text-2xl">👑</span>
                  ไพ่ตอง (Three of a Kind)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={rules.tongMultiplier}
                    onChange={(e) =>
                      updateMultiplier(
                        "tongMultiplier",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 text-center bg-black/30 border-white/20"
                  />
                  <span className="text-white/60">เท่า</span>
                </div>
              </div>
              <p className="text-xs text-white/50">
                ไพ่ 3 ใบเลขเดียวกัน (เช่น 7-7-7)
              </p>
            </div>

            {/* สามเหลือง */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-amber-400 font-bold flex items-center gap-2">
                  <span className="text-2xl">💛</span>
                  สามเหลือง
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={rules.samLeungMultiplier}
                    onChange={(e) =>
                      updateMultiplier(
                        "samLeungMultiplier",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 text-center bg-black/30 border-white/20"
                  />
                  <span className="text-white/60">เท่า</span>
                </div>
              </div>
              <p className="text-xs text-white/50">J-Q-K (ไพ่โป๊กเกอร์ 3 ใบ)</p>
            </div>

            {/* ไพ่เรียง */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-amber-400 font-bold flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  ไพ่เรียง (Straight)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={rules.straightMultiplier}
                    onChange={(e) =>
                      updateMultiplier(
                        "straightMultiplier",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 text-center bg-black/30 border-white/20"
                  />
                  <span className="text-white/60">เท่า</span>
                </div>
              </div>
              <p className="text-xs text-white/50">
                ไพ่ 3 ใบเรียงกัน (เช่น 5-6-7)
              </p>
            </div>

            {/* ไพ่สี */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-amber-400 font-bold flex items-center gap-2">
                  <span className="text-2xl">🎨</span>
                  ไพ่สี (Flush)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={rules.flushMultiplier}
                    onChange={(e) =>
                      updateMultiplier(
                        "flushMultiplier",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 text-center bg-black/30 border-white/20"
                  />
                  <span className="text-white/60">เท่า</span>
                </div>
              </div>
              <p className="text-xs text-white/50">ไพ่ 3 ใบดอกเดียวกัน</p>
            </div>

            {/* เด้ง */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-amber-400 font-bold flex items-center gap-2">
                  <span className="text-2xl">💥</span>
                  เด้ง (Same Suit)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={rules.dengMultiplier}
                    onChange={(e) =>
                      updateMultiplier(
                        "dengMultiplier",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 text-center bg-black/30 border-white/20"
                  />
                  <span className="text-white/60">เท่า</span>
                </div>
              </div>
              <p className="text-xs text-white/50">ไพ่ 2 ใบดอกเดียวกัน</p>
            </div>

            {/* ไพ่คู่ */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-amber-400 font-bold flex items-center gap-2">
                  <span className="text-2xl">👯</span>
                  ไพ่คู่ (Pair)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={rules.pairMultiplier}
                    onChange={(e) =>
                      updateMultiplier(
                        "pairMultiplier",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 text-center bg-black/30 border-white/20"
                  />
                  <span className="text-white/60">เท่า</span>
                </div>
              </div>
              <p className="text-xs text-white/50">ไพ่ 2 ใบเลขเดียวกัน</p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            รีเซ็ต
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
          >
            <Save className="w-4 h-4 mr-2" />
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook สำหรับใช้ custom rules
export function usePokDengCustomRules(roomCode: string) {
  const [rules, setRules] = useState<PokDengRules>(DEFAULT_RULES);

  useEffect(() => {
    const savedRules = localStorage.getItem(`pokdeng_rules_${roomCode}`);
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
  }, [roomCode]);

  return rules;
}
