import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Users, ArrowRight, Loader2, Spade, Zap } from 'lucide-react';
interface LobbyProps {
  onCreateRoom: (hostName: string) => Promise<any>;
  onJoinRoom: (code: string, playerName: string) => Promise<any>;
  onQuickStart?: (hostName: string) => Promise<any>;
  isLoading: boolean;
}
export function Lobby({
  onCreateRoom,
  onJoinRoom,
  onQuickStart,
  isLoading
}: LobbyProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [quickStartName, setQuickStartName] = useState('');
  const [showQuickStartModal, setShowQuickStartModal] = useState(false);
  const secretCodeRef = useRef('');

  // Secret shortcut: type "adminhee444" anywhere to quick start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const key = e.key.toLowerCase();
      const newCode = secretCodeRef.current + key;
      if ('adminhee444'.startsWith(newCode)) {
        secretCodeRef.current = newCode;
        if (newCode === 'adminhee444' && onQuickStart) {
          secretCodeRef.current = '';
          setShowQuickStartModal(true);
        }
      } else {
        // Reset if wrong key
        secretCodeRef.current = 'adminhee444'.startsWith(key) ? key : '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onQuickStart]);
  const handleCreate = async () => {
    if (!name.trim()) return;
    await onCreateRoom(name.trim());
  };
  const handleJoin = async () => {
    if (!name.trim() || !roomCode.trim()) return;
    await onJoinRoom(roomCode.trim(), name.trim());
  };
  const handleQuickStart = async () => {
    if (!quickStartName.trim() || !onQuickStart) return;
    await onQuickStart(quickStartName.trim());
    setShowQuickStartModal(false);
    setQuickStartName('');
  };
  return <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
          <Spade className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">ไพ่โดเรม่อน</h1>
        <p className="text-muted-foreground">เกมไพ่สำหรับปาร์ตี้</p>
      </div>

      {/* Main Card */}
      <div className="bg-card border border-border rounded-2xl shadow-lg w-full max-w-sm p-6">
        {mode === 'menu' && <div className="space-y-3">
            <Button variant="default" size="xl" className="w-full" onClick={() => setMode('create')}>
              <Plus className="w-5 h-5" />
              สร้างห้องใหม่
            </Button>
            {onQuickStart && <Button variant="secondary" size="xl" className="w-full" onClick={() => setShowQuickStartModal(true)} disabled={isLoading}>
                <Zap className="w-5 h-5" />
                เริ่มทันที
              </Button>}
            <Button variant="outline" size="xl" className="w-full" onClick={() => setMode('join')}>
              <Users className="w-5 h-5" />
              เข้าร่วมห้อง
            </Button>
          </div>}

        {mode === 'create' && <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-1">สร้างห้องใหม่</h2>
              <p className="text-muted-foreground text-sm">ใส่ชื่อของคุณเพื่อเริ่มเกม</p>
            </div>

            <Input placeholder="ชื่อของคุณ" value={name} onChange={e => setName(e.target.value)} className="text-center" maxLength={20} />

            <div className="flex gap-3">
              <Button variant="ghost" size="lg" className="flex-1" onClick={() => setMode('menu')}>
                ย้อนกลับ
              </Button>
              <Button variant="default" size="lg" className="flex-1" onClick={handleCreate} disabled={!name.trim() || isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                    สร้างห้อง
                    <ArrowRight className="w-4 h-4" />
                  </>}
              </Button>
            </div>
          </div>}

        {mode === 'join' && <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-1">เข้าร่วมห้อง</h2>
              <p className="text-muted-foreground text-sm">ใส่รหัสห้องและชื่อของคุณ</p>
            </div>

            <Input placeholder="รหัสห้อง (6 ตัว)" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} className="text-center text-xl font-mono tracking-widest" maxLength={6} />

            <Input placeholder="ชื่อของคุณ" value={name} onChange={e => setName(e.target.value)} className="text-center" maxLength={20} />

            <div className="flex gap-3">
              <Button variant="ghost" size="lg" className="flex-1" onClick={() => setMode('menu')}>
                ย้อนกลับ
              </Button>
              <Button variant="default" size="lg" className="flex-1" onClick={handleJoin} disabled={!name.trim() || roomCode.length !== 6 || isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                    เข้าร่วม
                    <ArrowRight className="w-4 h-4" />
                  </>}
              </Button>
            </div>
          </div>}
      </div>

      {/* Footer */}
      <p className="mt-8 text-muted-foreground/60 text-sm">ดืมให้ตายไปข้าง</p>

      {/* Quick Start Modal */}
      <Dialog open={showQuickStartModal} onOpenChange={setShowQuickStartModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">เริ่มเกมทันที</DialogTitle>
            <DialogDescription className="text-center">
              ใส่ชื่อของคุณแล้วเริ่มเล่นเลย!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input placeholder="ชื่อของคุณ" value={quickStartName} onChange={e => setQuickStartName(e.target.value)} className="text-center" maxLength={20} autoFocus onKeyDown={e => {
            if (e.key === 'Enter' && quickStartName.trim()) {
              void handleQuickStart();
            }
          }} />
            <Button variant="default" size="lg" className="w-full" onClick={handleQuickStart} disabled={!quickStartName.trim() || isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                  <Zap className="w-5 h-5" />
                  เริ่มเกม!
                </>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}