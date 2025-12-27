import { motion } from "framer-motion";

export function WaitingForPlayersAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-4 select-none">
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-3"
      >
        <span className="text-5xl sm:text-6xl block">📺</span>
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-white/70 text-sm sm:text-base font-medium"
      >
        รอผู้เล่นจั่วไพ่...
      </motion.p>
    </div>
  );
}
