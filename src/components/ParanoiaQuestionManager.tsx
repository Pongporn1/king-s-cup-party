import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen]);

  const loadQuestions = async () => {
    // Get current user ID
    let userId = localStorage.getItem("anonymousUserId");
    if (!userId) {
      userId = `anon_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem("anonymousUserId", userId);
    }

    // Try to load all questions first (for backward compatibility)
    const { data, error } = await supabase
      .from("paranoia_questions")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Paranoia questions loaded:", data, "Error:", error);

    if (error) {
      console.error("Error loading questions:", error);
      return;
    }

    // Filter: show default questions OR questions created by current user OR old questions without owner
    const questionsWithDefaults = (data || []).map(
      (q: Record<string, unknown>) => ({
        id: q.id as number,
        question: q.question as string,
        is_default: (q.is_default as boolean) ?? false,
        created_by: q.created_by as string | undefined,
        created_at: q.created_at as string | undefined,
      })
    );

    const filteredQuestions = questionsWithDefaults.filter(
      (q) => q.is_default === true || !q.created_by || q.created_by === userId
    );

    console.log(
      `User ${userId}: Showing ${filteredQuestions.length} of ${questionsWithDefaults.length} questions`
    );

    setQuestions(filteredQuestions);
  };

  const handleAdd = async () => {
    if (!newQuestion.trim()) {
      toast({
        title: "❌ กรุณาใส่คำถาม",
        variant: "destructive",
      });
      return;
    }

    // Get current user ID (from localStorage or generate anonymous ID)
    let userId = localStorage.getItem("anonymousUserId");
    if (!userId) {
      userId = `anon_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem("anonymousUserId", userId);
    }

    console.log("Adding question:", {
      question: newQuestion.trim(),
      userId,
    });

    const { data, error } = await supabase
      .from("paranoia_questions")
      .insert({
        question: newQuestion.trim(),
        is_default: false,
        created_by: userId,
      })
      .select();

    console.log("Insert result:", { data, error });

    if (error) {
      console.error("Error adding question:", error);
      toast({
        title: "❌ เพิ่มคำถามไม่สำเร็จ",
        description: error.message,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] z-[100]">
        <DialogHeader>
          <DialogTitle className="text-2xl">จัดการคำถาม Paranoia</DialogTitle>
          <DialogDescription className="sr-only">
            เพิ่ม แก้ไข หรือลบคำถาม Paranoia สำหรับเกม
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
          <ScrollArea className="h-[500px] w-full pr-4">
            <div className="space-y-2 pb-4">
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
