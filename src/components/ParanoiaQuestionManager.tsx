import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Pencil, Trash2, Plus, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateParanoiaQuestions } from "@/lib/aiService";

interface ParanoiaQuestion {
  id: number;
  question: string;
  is_default: boolean;
  created_at?: string;
}

export function ParanoiaQuestionManager() {
  const [questions, setQuestions] = useState<ParanoiaQuestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<ParanoiaQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen]);

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from("paranoia_questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading questions:", error);
      return;
    }

    // Ensure is_default field exists (default to false if missing)
    const questionsWithDefaults = (data || []).map(
      (q: Partial<ParanoiaQuestion> & { id: number; question: string }) => ({
        ...q,
        is_default: q.is_default ?? false,
      })
    );
    setQuestions(questionsWithDefaults);
  };

  const handleAdd = async () => {
    if (!newQuestion.trim()) {
      toast({
        title: "❌ กรุณาใส่คำถาม",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("paranoia_questions").insert({
      question: newQuestion.trim(),
      is_default: false,
    });

    if (error) {
      console.error("Error adding question:", error);
      toast({
        title: "❌ เพิ่มคำถามไม่สำเร็จ",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "✅ เพิ่มคำถามสำเร็จ!" });
    setNewQuestion("");
    loadQuestions();
  };

  const handleEdit = async () => {
    if (!editingQuestion || !newQuestion.trim()) return;

    if (editingQuestion.is_default) {
      toast({
        title: "❌ ไม่สามารถแก้ไขคำถามเริ่มต้นได้",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("paranoia_questions")
      .update({ question: newQuestion.trim() })
      .eq("id", editingQuestion.id);

    if (error) {
      console.error("Error updating question:", error);
      toast({
        title: "❌ แก้ไขคำถามไม่สำเร็จ",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "✅ แก้ไขคำถามสำเร็จ!" });
    setEditingQuestion(null);
    setNewQuestion("");
    loadQuestions();
  };

  const handleDelete = async (question: ParanoiaQuestion) => {
    if (question.is_default) {
      toast({
        title: "❌ ไม่สามารถลบคำถามเริ่มต้นได้",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("paranoia_questions")
      .delete()
      .eq("id", question.id);

    if (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "❌ ลบคำถามไม่สำเร็จ",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "✅ ลบคำถามสำเร็จ!" });
    loadQuestions();
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const aiQuestions = await generateParanoiaQuestions(5);

      // Insert all generated questions
      const { error } = await supabase.from("paranoia_questions").insert(
        aiQuestions.map((q) => ({
          question: q,
          is_default: false,
        }))
      );

      if (error) throw error;

      toast({
        title: "✨ สร้างคำถาม 5 คำด้วย AI สำเร็จ!",
        description: "คำถามใหม่ถูกเพิ่มเข้าไปแล้ว",
      });
      loadQuestions();
    } catch (error) {
      console.error("Error generating AI questions:", error);
      toast({
        title: "❌ สร้างคำถามไม่สำเร็จ",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" />
          จัดการคำถาม
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">จัดการคำถาม Paranoia</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI Generate Button */}
          <Button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating
              ? "กำลังสร้างด้วย AI..."
              : "✨ สร้างด้วย AI (5 คำถาม)"}
          </Button>

          {/* Add/Edit Form */}
          <div className="space-y-2">
            <Label htmlFor="question">
              {editingQuestion ? "แก้ไขคำถาม" : "เพิ่มคำถามใหม่"}
            </Label>
            <div className="flex gap-2">
              <Input
                id="question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="เช่น ใครที่คุณคิดว่ามีบุคลิกดีที่สุด?"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (editingQuestion) {
                      handleEdit();
                    } else {
                      handleAdd();
                    }
                  }
                }}
              />
              {editingQuestion ? (
                <>
                  <Button onClick={handleEdit}>บันทึก</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingQuestion(null);
                      setNewQuestion("");
                    }}
                  >
                    ยกเลิก
                  </Button>
                </>
              ) : (
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Search */}
          <Input
            placeholder="ค้นหาคำถาม..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Questions List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery
                    ? "ไม่พบคำถามที่ค้นหา"
                    : "ยังไม่มีคำถาม กดเพิ่มคำถามเพื่อเริ่มต้น"}
                </p>
              ) : (
                filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm">{question.question}</p>
                      {question.is_default && (
                        <span className="text-xs text-muted-foreground">
                          (คำถามเริ่มต้น)
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (question.is_default) {
                            toast({
                              title: "❌ ไม่สามารถแก้ไขคำถามเริ่มต้นได้",
                              variant: "destructive",
                            });
                            return;
                          }
                          setEditingQuestion(question);
                          setNewQuestion(question.question);
                        }}
                        disabled={question.is_default}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(question)}
                        disabled={question.is_default}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <p className="text-xs text-muted-foreground">
            ทั้งหมด {filteredQuestions.length} คำถาม
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
