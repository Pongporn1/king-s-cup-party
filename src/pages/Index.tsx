import { useGameRoom } from '@/hooks/useGameRoom';
import { Lobby } from '@/components/Lobby';
import { GameRoom } from '@/components/GameRoom';

const Index = () => {
  const {
    room,
    players,
    currentPlayerId,
    isLoading,
    createRoom,
    joinRoom,
    startGame,
    drawCard,
    reshuffleDeck,
    leaveRoom,
    quickStart
  } = useGameRoom();

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isHost = currentPlayer?.is_host ?? false;

  if (!room) {
    return (
      <Lobby
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onQuickStart={quickStart}
        isLoading={isLoading}
      />
    );
  }

  return (
    <GameRoom
      room={room}
      players={players}
      currentPlayerId={currentPlayerId}
      isHost={isHost}
      onStartGame={startGame}
      onDrawCard={drawCard}
      onReshuffle={reshuffleDeck}
      onLeave={leaveRoom}
    />
  );
};

export default Index;
