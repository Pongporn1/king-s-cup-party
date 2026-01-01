import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoginButton } from "@/components/LoginButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  UndercoverPlayer,
  GamePhase,
  VocabularyPair,
} from "@/lib/undercoverRules";
import { ArrowLeft, Eye } from "lucide-react";
import { t } from "@/lib/i18n";
import { Confetti } from "@/components/Confetti";

export interface UndercoverRoom {
  id: string;
  code: string;
  host_name: string;
  is_active: boolean;
  game_phase: GamePhase;
  current_turn_index: number;
  vocabulary: VocabularyPair | null;
  round: number;
  timer_seconds: number;
  include_mr_white: boolean;
  selected_category: string;
}

interface UndercoverGameRoomProps {
  room: UndercoverRoom;
  players: UndercoverPlayer[];
  currentPlayerId: string | null;
  isHost: boolean;
  categories: string[];
  onStartGame: (category: string, includeMrWhite: boolean) => void;
  onRestartGame: () => void;
  onLeave: () => void;
}

export function UndercoverGameRoom({
  room,
  players,
  currentPlayerId,
  isHost,
  categories,
  onStartGame,
  onRestartGame,
  onLeave,
}: UndercoverGameRoomProps) {
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [includeMrWhite, setIncludeMrWhite] = useState(false);
  const [showWord, setShowWord] = useState(false);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);

  const renderWaitingPhase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {t("room")}: {room.code}
        </h2>
        <p className="text-white/60">
          {t("waitingPlayers")} ({players.length}/10 {t("people")})
        </p>
      </div>

      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-white/80">
            {t("playersInRoom")}:
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-2 rounded bg-white/5"
              >
                <img
                  src={`${import.meta.env.BASE_URL}${player.avatar || 1}.jpg`}
                  alt={player.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/40"
                />
                <span className="flex-1">{player.name}</span>
                {player.is_host && (
                  <Badge variant="secondary" className="bg-purple-500/20">
                    👑 {t("host")}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isHost && (
        <Card className="bg-black/40 backdrop-blur-md border-white/10">
          <CardContent className="p-4 space-y-4">
            <div>
              <Label htmlFor="category" className="text-white/80">
                {t("category")}
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger
                  id="category"
                  className="bg-black/30 border-white/20 text-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="mr-white" className="text-white/80">
                {t("includeMrWhite")}
              </Label>
              <Switch
                id="mr-white"
                checked={includeMrWhite}
                onCheckedChange={(checked) => {
                  console.log("Mr. White toggled:", checked);
                  setIncludeMrWhite(checked);
                }}
              />
            </div>

            <Button
              onClick={() => {
                console.log("Starting game with:", {
                  selectedCategory,
                  includeMrWhite,
                });
                onStartGame(selectedCategory, includeMrWhite);
              }}
              disabled={players.length < 4}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {players.length < 4 ? t("needMinPlayers") : t("startGame")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderRevealWordPhase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t("seeYourWord")}</h2>
        <p className="text-white/60">{t("tapToReveal")}</p>
      </div>

      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardContent className="p-8">
          <div
            className="relative h-48 flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 cursor-pointer select-none"
            onMouseDown={() => setShowWord(true)}
            onMouseUp={() => setShowWord(false)}
            onMouseLeave={() => setShowWord(false)}
            onTouchStart={() => setShowWord(true)}
            onTouchEnd={() => setShowWord(false)}
          >
            {showWord ? (
              <div className="text-center">
                <p className="text-sm text-white/80 mb-2">{t("yourWordIs")}:</p>
                <p className="text-4xl font-bold">{currentPlayer?.word}</p>
                <p className="text-xs text-white/60 mt-2">
                  {t("role")}: {currentPlayer?.role}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Eye className="w-12 h-12 mb-2 mx-auto" />
                <p>{t("holdToSee")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Player list - show who has which role (for game play reference) */}
      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-white/80">
            {t("playersInRoom")}:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="p-3 rounded bg-white/5 flex items-center gap-2"
              >
                <img
                  src={`${import.meta.env.BASE_URL}${player.avatar || 1}.jpg`}
                  alt={player.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/40"
                />
                <span className="text-sm">{player.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isHost && (
        <Button
          onClick={onRestartGame}
          className="w-full bg-purple-500 hover:bg-purple-600"
        >
          🔄 {t("restartGame")}
        </Button>
      )}
    </div>
  );

  const renderFinishedPhase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">🎉 {t("gameOver")}!</h2>
      </div>

      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-white/80">
            {t("finalResult")}:
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded ${
                  player.is_alive ? "bg-green-900/20" : "bg-red-900/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`${import.meta.env.BASE_URL}${player.avatar || 1}.jpg`}
                    alt={player.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/40"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">
                      {player.name} {player.is_alive ? "✅" : "💀"}
                    </div>
                    <div className="text-sm text-white/60">
                      {player.role} - {player.word}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isHost && (
        <Button
          onClick={onRestartGame}
          className="w-full bg-purple-500 hover:bg-purple-600"
        >
          {t("restartGame")}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col p-4 sm:p-6 relative">
      {/* Confetti for game completion */}
      <Confetti active={room.game_phase === "FINISHED"} duration={5000} />

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}bg-party.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 to-black/80" />

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <Button
          variant="ghost"
          onClick={onLeave}
          className="text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t("leaveRoom")}
        </Button>
        <LoginButton
          currentRoomCode={room.code}
          currentGameType="undercover"
          currentGameName={t("undercoverTitle")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-2xl">
          {room.game_phase === "WAITING" && renderWaitingPhase()}
          {(room.game_phase === "REVEAL_WORD" ||
            room.game_phase === "DESCRIBE" ||
            room.game_phase === "VOTING" ||
            room.game_phase === "VOTE_RESULT") &&
            renderRevealWordPhase()}
          {room.game_phase === "FINISHED" && renderFinishedPhase()}
        </div>
      </div>
    </div>
  );
}
