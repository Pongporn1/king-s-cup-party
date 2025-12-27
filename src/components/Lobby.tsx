import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Users, ArrowRight, Loader2 } from 'lucide-react';

interface LobbyProps {
  onCreateRoom: (hostName: string) => Promise<any>;
  onJoinRoom: (code: string, playerName: string) => Promise<any>;
  isLoading: boolean;
}

export function Lobby({ onCreateRoom, onJoinRoom, isLoading }: LobbyProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    await onCreateRoom(name.trim());
  };

  const handleJoin = async () => {
    if (!name.trim() || !roomCode.trim()) return;
    await onJoinRoom(roomCode.trim(), name.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="font-orbitron text-5xl sm:text-7xl font-black mb-2">
          <span className="neon-text-pink">ไผ่</span>
          <span className="neon-text-cyan">โดเรม่อน</span>
        </h1>
        <p className="text-muted-foreground text-lg">เกมไพ่สำหรับปาร์ตี้</p>
      </div>

      {/* Main Card */}
      <div className="glass-card w-full max-w-md p-6 sm:p-8 animate-scale-in">
        {mode === 'menu' && (
          <div className="space-y-4">
            <Button
              variant="neon"
              size="xl"
              className="w-full"
              onClick={() => setMode('create')}
            >
              <Sparkles className="w-6 h-6" />
              สร้างห้องใหม่
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="w-full"
              onClick={() => setMode('join')}
            >
              <Users className="w-6 h-6" />
              เข้าร่วมห้อง
            </Button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">สร้างห้องใหม่</h2>
              <p className="text-muted-foreground text-sm">ใส่ชื่อของคุณเพื่อเริ่มเกม</p>
            </div>

            <Input
              placeholder="ชื่อของคุณ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center text-lg"
              maxLength={20}
            />

            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={() => setMode('menu')}
              >
                ย้อนกลับ
              </Button>
              <Button
                variant="neon"
                size="lg"
                className="flex-1"
                onClick={handleCreate}
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    สร้างห้อง
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">เข้าร่วมห้อง</h2>
              <p className="text-muted-foreground text-sm">ใส่รหัสห้องและชื่อของคุณ</p>
            </div>

            <Input
              placeholder="รหัสห้อง (6 ตัว)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="text-center text-2xl font-orbitron tracking-widest"
              maxLength={6}
            />

            <Input
              placeholder="ชื่อของคุณ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center text-lg"
              maxLength={20}
            />

            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={() => setMode('menu')}
              >
                ย้อนกลับ
              </Button>
              <Button
                variant="neon"
                size="lg"
                className="flex-1"
                onClick={handleJoin}
                disabled={!name.trim() || roomCode.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    เข้าร่วม
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-muted-foreground/50 text-sm">
        🍺 ดื่มอย่างมีสติ
      </p>
    </div>
  );
}
