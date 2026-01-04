import { motion } from "framer-motion";
import { Sparkles, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentTheme, type Theme } from "@/lib/themeSystem";

interface HeroSectionProps {
  title: string;
  description: string;
  coverUrl?: string;
  iconUrl?: string;
  emoji?: string;
  gradient?: string;
  onStartPlaying?: () => void;
}

export function HeroSection({
  title,
  description,
  coverUrl,
  iconUrl,
  emoji,
  gradient = "from-cyan-500 to-blue-600",
  onStartPlaying,
}: HeroSectionProps) {
  const [theme, setTheme] = useState<Theme>(getCurrentTheme());

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      setTheme(e.detail);
    };

    window.addEventListener("themechange", handleThemeChange as EventListener);
    return () => {
      window.removeEventListener(
        "themechange",
        handleThemeChange as EventListener
      );
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={
          coverUrl
            ? { backgroundImage: `url(${coverUrl})`, filter: "brightness(0.6)" }
            : undefined
        }
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Gradient fallback when no cover image - uses theme gradient */}
      {!coverUrl && (
        <div
          className="absolute inset-0 opacity-70"
          style={{ background: theme.gradient }}
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />

      {/* Content - centered with less bottom offset */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 md:px-8 text-center mb-4 md:mb-0 w-full">
        {/* Logo/Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center gap-3 md:gap-4 mb-4 md:mb-8"
        >
          <div
            className="w-20 h-20 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-lg shadow-black/30"
            style={{ background: theme.gradient }}
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
              <Crown className="w-10 h-10 md:w-10 md:h-10 text-white" />
            )}
          </div>
          <h1
            className="text-4xl md:text-7xl font-bold drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] text-center"
            style={{ color: theme.colors.text }}
          >
            {title}
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          // แก้ไข 1: เติม w-full ตรงนี้เพื่อให้ container กว้างเต็มจอ ข้อความข้างในจะได้จัดกลางเทียบกับจอ ไม่ใช่เทียบกับตัวเอง
          className="text-center mb-6 md:mb-12 w-full flex flex-col items-center"
        >
          <h2
            // แก้ไข 2: w-full และ text-center เพื่อความชัวร์
            className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 text-center w-full"
            style={{
              background: theme.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ULTIMATE PARTY EXPERIENCE
          </h2>
          <p
            className="text-base md:text-xl max-w-2xl text-center mx-auto"
            style={{ color: theme.colors.textSecondary }}
          >
            {description}
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex gap-8 flex-wrap justify-center"
        >
          {/* Example features array, replace with your actual data */}
          {([] as { icon: React.ReactNode; text: string }[]).map(
            (feature, index) => (
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
            )
          )}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 px-12 py-4 rounded-full font-bold text-lg shadow-lg transition-all flex items-center gap-3"
          style={{
            background: theme.gradient,
            color: theme.colors.text,
            boxShadow: `0 10px 40px ${theme.colors.primary}50`,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (onStartPlaying) {
              onStartPlaying();
            } else {
              document
                .getElementById("games-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <Sparkles className="w-6 h-6" />
          Start Playing
        </motion.button>
      </div>
    </div>
  );
}
