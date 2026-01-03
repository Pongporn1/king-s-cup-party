import { motion } from "framer-motion";
import { Sparkles, Crown } from "lucide-react";

interface HeroSectionProps {
  title: string;
  description: string;
  coverUrl?: string;
  iconUrl?: string;
  emoji?: string;
  gradient?: string;
}

export function HeroSection({
  title,
  description,
  coverUrl,
  iconUrl,
  emoji,
  gradient = "from-cyan-500 to-blue-600",
}: HeroSectionProps) {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${coverUrl || "/bg-party.jpg"})`,
          filter: "brightness(0.6)",
        }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        {/* Logo/Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-4 mb-8"
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br ${gradient} shadow-lg shadow-black/30`}
          >
            {iconUrl ? (
              <img
                src={iconUrl}
                alt={title}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : emoji ? (
              emoji
            ) : (
              <Crown className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-7xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
            {title}
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            ULTIMATE PARTY EXPERIENCE
          </h2>
          <p className="text-xl text-white/80 max-w-2xl">{description}</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex gap-8 flex-wrap justify-center"
        >
          {[].map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="text-white font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white font-bold text-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            document
              .getElementById("games-section")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <Sparkles className="w-6 h-6" />
          Start Playing
        </motion.button>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
