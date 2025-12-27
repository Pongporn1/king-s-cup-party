import { useState, useEffect } from "react";
import { CARD_RULES, CardRule } from "@/lib/cardRules";

const STORAGE_KEY_PREFIX = "custom_rules_";

export function useCustomRules(roomCode: string) {
  const [customRules, setCustomRules] =
    useState<Record<string, CardRule>>(CARD_RULES);

  useEffect(() => {
    // Load custom rules from localStorage
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + roomCode);
    if (stored) {
      try {
        setCustomRules(JSON.parse(stored));
      } catch {
        setCustomRules(CARD_RULES);
      }
    }
  }, [roomCode]);

  const saveRules = (rules: Record<string, CardRule>) => {
    setCustomRules(rules);
    localStorage.setItem(STORAGE_KEY_PREFIX + roomCode, JSON.stringify(rules));
  };

  const resetRules = () => {
    setCustomRules(CARD_RULES);
    localStorage.removeItem(STORAGE_KEY_PREFIX + roomCode);
  };

  return { customRules, saveRules, resetRules };
}
