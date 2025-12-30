import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, UserPlus } from "lucide-react";

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

  const handleCreate = () => {
    if (hostName.trim()) {
      onCreateRoom(hostName.trim());
    }
  };

  const handleJoin = () => {
    if (playerName.trim() && roomCode.trim()) {
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
        กลับ
      </Button>

      {/* Logo */}
      <div className="text-center mb-6 sm:mb-8 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
           Undercover
        </h1>
        <p className="text-white/80 text-base sm:text-lg">
          สายลับจับแอ๊บ - หาคนแปลกปลอม!
        </p>
      </div>

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
                สร้างห้อง
              </TabsTrigger>
              <TabsTrigger
                value="join"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                เข้าร่วม
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-white/60 block mb-2">
                  ชื่อของคุณ
                </label>
                <Input
                  type="text"
                  placeholder="ใส่ชื่อ..."
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
                {isLoading ? "กำลังสร้าง..." : "สร้างห้องใหม่"}
              </Button>
            </TabsContent>

            <TabsContent value="join" className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-white/60 block mb-2">
                  รหัสห้อง
                </label>
                <Input
                  type="text"
                  placeholder="ใส่รหัส 6 ตัว..."
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="bg-black/30 border-white/20 text-white placeholder:text-white/40 font-mono text-center text-xl tracking-widest"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-2">
                  ชื่อของคุณ
                </label>
                <Input
                  type="text"
                  placeholder="ใส่ชื่อ..."
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
                {isLoading ? "กำลังเข้าร่วม..." : "🚪 เข้าร่วมห้อง"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="mt-6 text-center text-white/60 text-sm relative z-10 max-w-md">
        <p className="mb-2"> กติกา:</p>
        <p>ทุกคนจะได้รับคำศัพท์ - แต่สายลับจะได้คำที่ต่างออกไป!</p>
        <p>ใบ้คำของตัวเอง แต่อย่าชัดเกินไป หาให้ได้ว่าใครคือสายลับ!</p>
      </div>
    </div>
  );
}
