import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { setLanguage, getLanguage, Language } from "@/lib/i18n";

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());

  useEffect(() => {
    setCurrentLang(getLanguage());
  }, []);

  const toggleLanguage = () => {
    const newLang: Language = currentLang === "th" ? "en" : "th";
    setLanguage(newLang);
    setCurrentLang(newLang);
    // Reload to apply translations
    window.location.reload();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="bg-black/40 backdrop-blur-md border-white/20 text-white hover:bg-black/60"
    >
      <Languages className="w-4 h-4 mr-2" />
      {currentLang === "th" ? "TH" : "EN"}
    </Button>
  );
}
