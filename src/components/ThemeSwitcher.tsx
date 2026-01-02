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
import { Palette } from "lucide-react";
import {
  themes,
  getCurrentTheme,
  setTheme,
  type Theme,
} from "@/lib/themeSystem";
import { t, getLanguage } from "@/lib/i18n";

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getCurrentTheme());
  const [open, setOpen] = useState(false);
  const currentLanguage = getLanguage();

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail);
    };

    window.addEventListener("themechange", handleThemeChange as EventListener);
    return () => {
      window.removeEventListener(
        "themechange",
        handleThemeChange as EventListener
      );
    };
  }, []);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    setCurrentTheme(themes.find((t) => t.id === themeId) || themes[0]);
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
