import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Search,
  Sparkles,
  Loader2,
} from "lucide-react";
import { VocabularyPair } from "@/lib/undercoverRules";
import { t } from "@/lib/i18n";
import { generateVocabularyPairs } from "@/lib/aiService";
import { useToast } from "@/hooks/use-toast";

interface VocabularyManagerProps {
  vocabularies: VocabularyPair[];
  categories: string[];
  onAdd: (vocab: Omit<VocabularyPair, "id">) => void;
  onUpdate: (vocab: VocabularyPair) => void;
  onDelete: (id: number) => void;
}

export function VocabularyManager({
  vocabularies,
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: VocabularyManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState<VocabularyPair | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Form state
  const [category, setCategory] = useState("");
  const [wordCivilian, setWordCivilian] = useState("");
  const [wordUndercover, setWordUndercover] = useState("");

  // Group vocabularies by category
  const groupedVocabs = useMemo(() => {
    const filtered = vocabularies.filter((v) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        v.category.toLowerCase().includes(query) ||
        v.word_civilian.toLowerCase().includes(query) ||
        v.word_undercover.toLowerCase().includes(query)
      );
    });

    const grouped: Record<string, VocabularyPair[]> = {};
    filtered.forEach((vocab) => {
      if (!grouped[vocab.category]) {
        grouped[vocab.category] = [];
      }
      grouped[vocab.category].push(vocab);
    });

    // Sort categories alphabetically
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [vocabularies, searchQuery]);

  const handleOpenAdd = () => {
    setEditingVocab(null);
    setCategory("");
    setWordCivilian("");
    setWordUndercover("");
    setIsOpen(true);
  };

  const handleOpenEdit = (vocab: VocabularyPair) => {
    setEditingVocab(vocab);
    setCategory(vocab.category);
    setWordCivilian(vocab.word_civilian);
    setWordUndercover(vocab.word_undercover);
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!category || !wordCivilian || !wordUndercover) return;

    if (editingVocab) {
      onUpdate({
        ...editingVocab,
        category,
        word_civilian: wordCivilian,
        word_undercover: wordUndercover,
      });
    } else {
      onAdd({
        category,
        word_civilian: wordCivilian,
        word_undercover: wordUndercover,
      });
    }

    setIsOpen(false);
  };

  const handleGenerateWithAI = async () => {
    if (!category.trim()) {
      toast({
        title: "กรุณาใส่หมวดหมู่",
        description: "ใส่หมวดหมู่ที่ต้องการให้ AI สร้างคำศัพท์",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedPairs = await generateVocabularyPairs(category, 3);

      // Add all generated pairs
      generatedPairs.forEach((pair) => {
        onAdd(pair);
      });

      toast({
        title: "✨ สร้างคำศัพท์สำเร็จ!",
        description: `เพิ่ม ${generatedPairs.length} คำคู่ในหมวด "${category}"`,
      });

      setIsOpen(false);
      // Clear form
      setCategory("");
      setWordCivilian("");
      setWordUndercover("");
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error ? error.message : "ไม่สามารถสร้างคำศัพท์ได้",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">
            {t("vocabularyManager")}
          </h3>
          <Badge variant="secondary" className="bg-purple-500/20">
            {vocabularies.length} {t("words")}
          </Badge>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleOpenAdd}
              size="sm"
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              {t("addWord")}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 text-white border-white/20">
            <DialogHeader>
              <DialogTitle>
                {editingVocab ? t("editVocabulary") : t("addVocabulary")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {editingVocab ? "แก้ไขคำศัพท์" : "เพิ่มคำศัพท์ใหม่"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="category">{t("category")}</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={t("categoryPlaceholder")}
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="civilian">{t("civilianWord")}</Label>
                <Input
                  id="civilian"
                  value={wordCivilian}
                  onChange={(e) => setWordCivilian(e.target.value)}
                  placeholder={t("civilianPlaceholder")}
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="undercover">{t("undercoverWord")}</Label>
                <Input
                  id="undercover"
                  value={wordUndercover}
                  onChange={(e) => setWordUndercover(e.target.value)}
                  placeholder={t("undercoverPlaceholder")}
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>

              {/* AI Generate Button */}
              {!editingVocab && (
                <Button
                  onClick={handleGenerateWithAI}
                  disabled={!category.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  variant="default"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังสร้างด้วย AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />✨ สร้างด้วย AI (3
                      คำ)
                    </>
                  )}
                </Button>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-white/40">
                    {!editingVocab ? "หรือเพิ่มเอง" : ""}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!category || !wordCivilian || !wordUndercover}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                {editingVocab ? t("save") : t("add")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          type="text"
          placeholder={t("searchVocabulary")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-black/30 border-white/20 text-white pl-10"
        />
      </div>

      {/* Grouped by Category */}
      <Accordion type="multiple" className="space-y-2">
        {groupedVocabs.map(([categoryName, vocabs]) => (
          <AccordionItem
            key={categoryName}
            value={categoryName}
            className="bg-black/40 border-white/10 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 hover:bg-white/5 hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">{categoryName}</span>
                <Badge variant="secondary" className="bg-purple-500/20">
                  {vocabs.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2 mt-2">
                {vocabs.map((vocab) => (
                  <Card key={vocab.id} className="bg-black/40 border-white/10">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-white/60 text-xs block mb-1">
                              {t("civilian")}
                            </span>
                            <span className="text-green-400 font-medium">
                              {vocab.word_civilian}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/60 text-xs block mb-1">
                              {t("undercover")}
                            </span>
                            <span className="text-red-400 font-medium">
                              {vocab.word_undercover}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEdit(vocab)}
                            disabled={vocab.id < 1000}
                            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              vocab.id < 1000
                                ? t("cannotEditDefault")
                                : t("edit")
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(vocab.id)}
                            disabled={vocab.id < 1000}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              vocab.id < 1000
                                ? t("cannotDeleteDefault")
                                : t("delete")
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {groupedVocabs.length === 0 && (
        <div className="text-center py-12 text-white/40">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{searchQuery ? t("noVocabularyFound") : t("noVocabularyYet")}</p>
        </div>
      )}
    </div>
  );
}
