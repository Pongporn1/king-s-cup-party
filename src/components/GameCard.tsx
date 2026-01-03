import { motion } from "framer-motion";
import { Play, Users, Clock } from "lucide-react";

interface GameCardProps {
  game: {
    id: string;
    emoji: string;
    name: string;
    desc: string;
    gradient: string;
    bgColor: string;
    minPlayers?: number;
    maxPlayers?: number;
    avgTime?: string;
  };
  coverImage?: string;
  onPlay: () => void;
  index?: number;
}

export function GameCard({
  game,
  coverImage,
  onPlay,
  index = 0,
}: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative h-full"
    >
      <motion.div
        className="relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPlay}
      >
        {/* Background with gradient or custom image */}
        {coverImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
            {/* Overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          </>
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${game.gradient}`}
          />
        )}

        {/* Play Button (center) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center shadow-2xl">
            <Play className="w-8 h-8 fill-black text-black ml-1" />
          </div>
        </motion.div>

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-2xl font-black text-white drop-shadow-2xl text-center">
            {game.name}
          </h3>
        </div>
      </motion.div>
    </motion.div>
  );
}
