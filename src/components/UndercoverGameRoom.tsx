import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
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
  onStartDescribePhase: () => void;
  onNextTurn: () => void;
  onStartVoting: () => void;
  onVotePlayer: (playerId: string) => void;
  onCheckResultAndContinue: () => void;
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
  onStartDescribePhase,
  onNextTurn,
  onStartVoting,
  onVotePlayer,
  onCheckResultAndContinue,
  onRestartGame,
  onLeave,
}: UndercoverGameRoomProps) {
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [includeMrWhite, setIncludeMrWhite] = useState(false);
  const [showWord, setShowWord] = useState(false);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const alivePlayers = players.filter((p) => p.is_alive);
  const currentTurnPlayer =
    room.game_phase === "DESCRIBE"
      ? alivePlayers[room.current_turn_index % alivePlayers.length]
      : null;

  const renderWaitingPhase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {t("room")}: {room.code}
        </h2>
        <p className="text-white/60">
          {t("waitingPlayers")} ({players.length}/8 {t("people")})
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
                onCheckedChange={setIncludeMrWhite}
              />
            </div>

            <Button
              onClick={() => onStartGame(selectedCategory, includeMrWhite)}
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

      {isHost && (
        <Button
          onClick={onStartDescribePhase}
          className="w-full bg-purple-500 hover:bg-purple-600"
        >
          {t("startDescribe")}
        </Button>
      )}
    </div>
  );

  const renderDescribePhase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {t("describeRound")} #{room.round}
        </h2>
        <p className="text-white/60">
          {t("turn")}: {currentTurnPlayer?.name || "..."}
        </p>
      </div>

      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-white/80">
            {t("alivePlayers")}:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {alivePlayers.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded ${
                  player.id === currentTurnPlayer?.id
                    ? "bg-purple-500/30 ring-2 ring-purple-500"
                    : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={`${import.meta.env.BASE_URL}${player.avatar || 1}.jpg`}
                    alt={player.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/40"
                  />
                  <span className="text-sm">{player.name}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isHost && (
        <div className="space-y-2">
          <Button
            onClick={onNextTurn}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            {t("nextPerson")}
          </Button>
          <Button
            onClick={onStartVoting}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            {t("startVoting")}
          </Button>
        </div>
      )}
    </div>
  );

  const renderVotingPhase = () => {
    const hasVoted = currentPlayer?.has_voted;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t("vote")}!</h2>
          <p className="text-white/60">
            {hasVoted ? t("waitingForOthers") : t("selectSuspect")}
          </p>
        </div>

        <Card className="bg-black/40 backdrop-blur-md border-white/10">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {alivePlayers
                .filter((p) => p.id !== currentPlayerId)
                .map((player) => (
                  <Button
                    key={player.id}
                    onClick={() => onVotePlayer(player.id)}
                    disabled={hasVoted}
                    variant="outline"
                    className="h-auto p-3 bg-white/5 hover:bg-purple-500/20 border-white/20 flex flex-col items-center"
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}${
                        player.avatar || 1
                      }.jpg`}
                      alt={player.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/40 mb-2"
                    />
                    <div className="text-sm">{player.name}</div>
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderVoteResultPhase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t("voteResult")}</h2>
      </div>

      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <div className="space-y-3">
            {players
              .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
              .map((player) => (
                <div
                  key={player.id}
                  className={`p-3 rounded flex items-center justify-between ${
                    !player.is_alive ? "bg-red-900/20" : "bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`${import.meta.env.BASE_URL}${
                        player.avatar || 1
                      }.jpg`}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/40"
                    />
                    <div>
                      <div className="font-semibold">
                        {player.name}
                        {!player.is_alive && " 💀"}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {player.vote_count || 0} {t("votes")}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {isHost && (
        <Button
          onClick={onCheckResultAndContinue}
          className="w-full bg-purple-500 hover:bg-purple-600"
        >
          {t("continue")}
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

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onLeave}
        className="absolute top-4 left-4 text-white/70 hover:text-white z-20"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        {t("leaveRoom")}
      </Button>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-2xl">
          {room.game_phase === "WAITING" && renderWaitingPhase()}
          {room.game_phase === "REVEAL_WORD" && renderRevealWordPhase()}
          {room.game_phase === "DESCRIBE" && renderDescribePhase()}
          {room.game_phase === "VOTING" && renderVotingPhase()}
          {room.game_phase === "VOTE_RESULT" && renderVoteResultPhase()}
          {room.game_phase === "FINISHED" && renderFinishedPhase()}
        </div>
      </div>
    </div>
  );
}
