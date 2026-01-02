import { useEffect, useState } from "react";
import { getCurrentTheme, type Theme } from "@/lib/themeSystem";

export default function ThemedBackground() {
  const [theme, setTheme] = useState<Theme>(getCurrentTheme());

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      console.log(
        `🎨 ThemedBackground: Received theme change to ${e.detail.name}`
      );
      setTheme(e.detail);
    };

    const handleWeatherUpdate = () => {
      // Force re-fetch current theme when weather updates
      console.log(`🌤️ ThemedBackground: Weather updated, refreshing theme`);
      const newTheme = getCurrentTheme();
      console.log(`🎨 ThemedBackground: Applying theme ${newTheme.name}`);
      setTheme(newTheme);
    };

    window.addEventListener("themechange", handleThemeChange as EventListener);
    window.addEventListener(
      "weatherupdated",
      handleWeatherUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "themechange",
        handleThemeChange as EventListener
      );
      window.removeEventListener(
        "weatherupdated",
        handleWeatherUpdate as EventListener
      );
    };
  }, []);

  return (
    <>
      {/* Background gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: theme.gradient,
        }}
      />

      {/* Background image if available */}
      {theme.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 transition-opacity duration-1000"
          style={{
            backgroundImage: theme.backgroundImage,
          }}
        />
      )}

      {/* Animated overlay */}
      <div className="absolute inset-0 bg-black/30 transition-colors duration-1000" />

      {/* Animated particles/shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-float"
          style={{
            backgroundColor: theme.colors.primary,
            top: "10%",
            left: "10%",
            animationDelay: "0s",
            animationDuration: "8s",
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 animate-float"
          style={{
            backgroundColor: theme.colors.secondary,
            top: "60%",
            right: "10%",
            animationDelay: "2s",
            animationDuration: "10s",
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 animate-float"
          style={{
            backgroundColor: theme.colors.accent,
            bottom: "20%",
            left: "50%",
            animationDelay: "4s",
            animationDuration: "12s",
          }}
        />
      </div>
    </>
  );
}
