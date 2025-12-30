import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Users, UserPlus, Settings } from "lucide-react";
import { VocabularyManager } from "@/components/VocabularyManager";
import {
  getAllVocabularies,
  addVocabulary,
  updateVocabulary,
  deleteVocabulary,
  getCategories,
  VocabularyPair,
} from "@/lib/undercoverRules";
import { t } from "@/lib/i18n";
import { validateName } from "@/lib/nameValidation";
import { useToast } from "@/hooks/use-toast";

interface UndercoverLobbyProps {
  onCreateRoom: (hostName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function UndercoverLobby({
  onCreateRoom,
  onJoinRoom,
  onBack,
  isLoading,
}: UndercoverLobbyProps) {
  const [hostName, setHostName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [vocabularies, setVocabularies] = useState<VocabularyPair[]>(
    getAllVocabularies()
  );
  const [isVocabDialogOpen, setIsVocabDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddVocab = (vocab: Omit<VocabularyPair, "id">) => {
    addVocabulary(vocab);
    setVocabularies(getAllVocabularies());
  };

  const handleUpdateVocab = (vocab: VocabularyPair) => {
    updateVocabulary(vocab);
    setVocabularies(getAllVocabularies());
  };

  const handleDeleteVocab = (id: number) => {
    deleteVocabulary(id);
    setVocabularies(getAllVocabularies());
  };

  const handleCreate = () => {
    const validation = validateName(hostName);
    if (!validation.isValid) {
      toast({
        title: t("error"),
        description: validation.error || t("invalidName"),
        variant: "destructive",
      });
      return;
    }
    onCreateRoom(hostName.trim());
  };

  const handleJoin = () => {
    const validation = validateName(playerName);
    if (!validation.isValid) {
      toast({
        title: t("error"),
        description: validation.error || t("invalidName"),
        variant: "destructive",
      });
      return;
    }
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}bg-party.jpg')`,
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 to-black/80" />

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="absolute top-4 left-4 text-white/70 hover:text-white z-20"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        {t("back")}
      </Button>

      {/* Logo */}
      <div className="text-center mb-6 sm:mb-8 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          {t("undercoverTitle")}
        </h1>
        <p className="text-white/80 text-base sm:text-lg">
          {t("undercoverSubtitle")}
        </p>
      </div>
      {/* Vocabulary Manager Button */}
      <Dialog open={isVocabDialogOpen} onOpenChange={setIsVocabDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="absolute top-4 right-4 text-white/70 hover:text-white z-20 border-white/20"
          >
            <Settings className="w-5 h-5 mr-2" />
            {t("manageWords")}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 text-white border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("vocabularyManager")}</DialogTitle>
          </DialogHeader>
          <VocabularyManager
            vocabularies={vocabularies}
            categories={getCategories()}
            onAdd={handleAddVocab}
            onUpdate={handleUpdateVocab}
            onDelete={handleDeleteVocab}
          />
        </DialogContent>
      </Dialog>
      {/* Main Card */}
      <Card className="bg-black/40 backdrop-blur-md border-white/10 w-full max-w-md relative z-10">
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/40">
              <TabsTrigger
                value="create"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                {t("createRoom")}
              </TabsTrigger>
              <TabsTrigger
                value="join"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {t("joinRoom")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-white/60 block mb-2">
                  {t("yourName")}
                </label>
                <Input
                  type="text"
                  placeholder={t("enterName")}
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
                  maxLength={20}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!hostName.trim() || isLoading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isLoading ? t("creating") : t("createNewRoom")}
              </Button>
            </TabsContent>

            <TabsContent value="join" className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-white/60 block mb-2">
                  {t("roomCode")}
                </label>
                <Input
                  type="text"
                  placeholder={t("enterCode")}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="bg-black/30 border-white/20 text-white placeholder:text-white/40 font-mono text-center text-xl tracking-widest"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-2">
                  {t("yourName")}
                </label>
                <Input
                  type="text"
                  placeholder={t("enterName")}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-black/30 border-white/20 text-white placeholder:text-white/40"
                  maxLength={20}
                />
              </div>
              <Button
                onClick={handleJoin}
                disabled={
                  !playerName.trim() || roomCode.length !== 6 || isLoading
                }
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                {isLoading ? t("joining") : t("joinRoomBtn")}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
