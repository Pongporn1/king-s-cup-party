import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, RotateCcw, Save } from "lucide-react";
import { CARD_RULES, CardRule, VALUES } from "@/lib/cardRules";
import { useCustomRules } from "@/hooks/useCustomRules";
import { useToast } from "@/hooks/use-toast";

interface RuleEditorProps {
  roomCode: string;
  isHost: boolean;
  onRulesChange?: (rules: Record<string, CardRule>) => void;
}

export function RuleEditor({
  roomCode,
  isHost,
  onRulesChange,
}: RuleEditorProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRules, setEditingRules] =
    useState<Record<string, CardRule>>(CARD_RULES);
  const { customRules, saveRules, resetRules } = useCustomRules(roomCode);

  useEffect(() => {
    setEditingRules(customRules);
    onRulesChange?.(customRules);
  }, [customRules, onRulesChange]);

  const handleSave = () => {
    saveRules(editingRules);
    onRulesChange?.(editingRules);
    setIsOpen(false);
    toast({
      title: "✅ บันทึกกฎสำเร็จ!",
      description: "กฎใหม่จะใช้ในเกมนี้",
    });
  };

  const handleReset = () => {
    resetRules();
    setEditingRules(CARD_RULES);
    onRulesChange?.(CARD_RULES);
    toast({
      title: "🔄 รีเซ็ตกฎแล้ว",
      description: "กลับไปใช้กฎเริ่มต้น",
    });
  };

  const updateRule = (
    value: string,
    field: keyof CardRule,
    newValue: string
  ) => {
    setEditingRules((prev) => ({
      ...prev,
      [value]: {
        ...prev[value],
        [field]: newValue,
      },
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
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] bg-gray-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            ⚙️ แก้ไขกฎไพ่
          </DialogTitle>
          <DialogDescription className="sr-only">
            แก้ไขกฎสำหรับแต่ละใบไพ่
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {VALUES.map((value) => (
              <div
                key={value}
                className="bg-black/40 rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg font-bold">
                    {value}
                  </span>
                  <Input
                    value={editingRules[value]?.emoji || "🃏"}
                    onChange={(e) => updateRule(value, "emoji", e.target.value)}
                    className="w-16 text-center text-xl bg-black/30 border-white/20"
                    placeholder="🃏"
                  />
                  <Input
                    value={editingRules[value]?.title || ""}
                    onChange={(e) => updateRule(value, "title", e.target.value)}
                    className="flex-1 bg-black/30 border-white/20"
                    placeholder="ชื่อกฎ"
                  />
                </div>
                <Textarea
                  value={editingRules[value]?.description || ""}
                  onChange={(e) =>
                    updateRule(value, "description", e.target.value)
                  }
                  className="bg-black/30 border-white/20 resize-none"
                  placeholder="รายละเอียดกฎ..."
                  rows={2}
                />
              </div>
            ))}
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
