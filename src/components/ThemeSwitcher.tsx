import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Palette, CloudSun } from "lucide-react";
import {
  themes,
  getCurrentTheme,
  setTheme,
  isWeatherModeEnabled,
  setWeatherMode,
  updateThemeByWeather,
  type Theme,
} from "@/lib/themeSystem";
import { t, getLanguage } from "@/lib/i18n";

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getCurrentTheme());
  const [open, setOpen] = useState(false);
  const [weatherMode, setWeatherModeState] = useState(isWeatherModeEnabled());
  const [weatherStatus, setWeatherStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const currentLanguage = getLanguage();

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail);
    };

    const handleWeatherUpdate = (e: CustomEvent) => {
      const { weather, description, isDay, theme } = e.detail;
      setWeatherStatus(
        `${weather} (${description}) - ${isDay ? "Day" : "Night"} → ${theme}`
      );
      setIsLoading(false);
    };

    const handleWeatherError = (e: CustomEvent) => {
      setWeatherStatus(`Error: ${e.detail.error}`);
      setIsLoading(false);
    };

    window.addEventListener("themechange", handleThemeChange as EventListener);
    window.addEventListener(
      "weatherupdated",
      handleWeatherUpdate as EventListener
    );
    window.addEventListener(
      "weathererror",
      handleWeatherError as EventListener
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
      window.removeEventListener(
        "weathererror",
        handleWeatherError as EventListener
      );
    };
  }, []);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    setCurrentTheme(themes.find((t) => t.id === themeId) || themes[0]);
  };

  const handleWeatherToggle = async () => {
    const newValue = !weatherMode;
    setWeatherModeState(newValue);
    setWeatherMode(newValue);

    if (newValue) {
      setIsLoading(true);
      setWeatherStatus("กำลังตรวจสอบสภาพอากาศ...");
      await updateThemeByWeather();
      setCurrentTheme(getCurrentTheme());
    } else {
      setWeatherStatus("");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-110"
          title={t("themeChange")}
        >
          <Palette className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-black/90 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {t("themeSelectTheme")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            เลือกธีมสีสำหรับเกม
          </DialogDescription>
        </DialogHeader>

        {/* Weather Mode Toggle */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudSun className="h-6 w-6 text-cyan-400" />
              <div>
                <p className="text-white font-semibold">
                  {currentLanguage === "th" ? "โหมดสภาพอากาศ" : "Weather Mode"}
                </p>
                <p className="text-xs text-white/60">
                  {currentLanguage === "th"
                    ? "เปลี่ยนธีมอัตโนมัติตามสภาพอากาศจริง"
                    : "Auto-change theme based on real weather"}
                </p>
                {weatherStatus && (
                  <p className="text-xs text-cyan-300 mt-1 font-mono">
                    {isLoading
                      ? "⏳ "
                      : weatherStatus.includes("Error")
                      ? "❌ "
                      : "✅ "}
                    {weatherStatus}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleWeatherToggle}
              disabled={isLoading}
              className={`
                relative w-14 h-7 rounded-full transition-all duration-300
                ${weatherMode ? "bg-cyan-500" : "bg-gray-600"}
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <div
                className={`
                  absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300
                  ${weatherMode ? "translate-x-7" : "translate-x-0"}
                `}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                handleThemeChange(theme.id);
                setOpen(false);
              }}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105
                ${
                  currentTheme.id === theme.id
                    ? "border-white shadow-xl scale-105"
                    : "border-white/20 hover:border-white/40"
                }
              `}
              style={{
                background: theme.gradient,
              }}
            >
              {/* Theme preview */}
              <div className="flex flex-col items-center gap-2">
                {/* Color swatches */}
                <div className="flex gap-1">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/50"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/50"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/50"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>

                {/* Theme name */}
                <div className="text-center">
                  <p className="font-bold text-white text-lg">
                    {currentLanguage === "th" ? theme.name : theme.nameEn}
                  </p>
                </div>

                {/* Selected indicator */}
                {currentTheme.id === theme.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <span className="text-black text-sm">✓</span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
