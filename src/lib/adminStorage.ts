import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "admin_floating_names";
// Try games first, then fall back to legacy game_covers
const GAME_TABLES = ["games", "game_covers"] as const;

// Fallback to localStorage if Supabase fails
function getLocalNames(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalNames(names: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
}

// Supabase functions for persistent storage across all devices
export async function getFloatingNamesFromDB(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("floating_names")
      .select("name")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching floating names:", error);
      return getLocalNames(); // Fallback to local
    }

    return data?.map((item: { name: string }) => item.name) || [];
  } catch {
    return getLocalNames();
  }
}

export async function addFloatingName(name: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("floating_names").insert({ name });

    if (error) {
      console.error("Error adding floating name:", error);
      // Fallback to local
      const names = getLocalNames();
      names.push(name);
      saveLocalNames(names);
      return false;
    }

    return true;
  } catch {
    const names = getLocalNames();
    names.push(name);
    saveLocalNames(names);
    return false;
  }
}

export async function removeFloatingName(name: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("floating_names")
      .delete()
      .eq("name", name);

    if (error) {
      console.error("Error removing floating name:", error);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function clearAllFloatingNames(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("floating_names")
      .delete()
      .neq("name", ""); // Delete all rows

    if (error) {
      console.error("Error clearing floating names:", error);
      return false;
    }

    saveLocalNames([]); // Also clear local
    return true;
  } catch {
    return false;
  }
}

// Keep old sync functions for backward compatibility
export function getFloatingNames(): string[] {
  return getLocalNames();
}

export function saveFloatingNames(names: string[]) {
  saveLocalNames(names);
}

// Game Cover Storage Functions
const GAME_COVERS_KEY = "admin_game_covers";

// Game Icon Storage Functions (local-first)
const GAME_ICONS_KEY = "admin_game_icons";

// Game Profile Storage Functions
const GAME_PROFILES_KEY = "admin_game_profiles";

export interface GameProfile {
  title: string;
  emoji?: string | null;
  gradient?: string | null;
}

export interface GameCover {
  gameId: string;
  imageUrl: string;
  updatedAt: string;
}

export interface GameIcon {
  gameId: string;
  imageUrl: string;
  updatedAt: string;
}

// Fallback localStorage functions
function getLocalGameCovers(): Record<string, string> {
  try {
    const stored = localStorage.getItem(GAME_COVERS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function getLocalGameIcons(): Record<string, string> {
  try {
    const stored = localStorage.getItem(GAME_ICONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function getLocalGameProfiles(): Record<string, GameProfile> {
  try {
    const stored = localStorage.getItem(GAME_PROFILES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export async function getGameCovers(): Promise<Record<string, string>> {
  try {
    for (const table of GAME_TABLES) {
      const { data, error } = await supabase
        .from(table as any)
        .select("id, cover_url")
        .not("cover_url", "is", null);

      if (error) {
        console.error(`Error fetching covers from ${table}:`, error);
        continue;
      }

      const covers: Record<string, string> = {};
      (data as any[])?.forEach((item: { id: string; cover_url: string }) => {
        if (item.cover_url) covers[item.id] = item.cover_url;
      });

      if (Object.keys(covers).length > 0) {
        return covers;
      }
    }
  } catch (err) {
    console.error("Exception loading covers:", err);
  }

  const localCovers = getLocalGameCovers();
  return localCovers;
}

export async function getGameIcons(): Promise<Record<string, string>> {
  try {
    for (const table of GAME_TABLES) {
      const { data, error } = await supabase
        .from(table as any)
        .select("id, image_url")
        .not("image_url", "is", null);

      if (error) {
        console.error(`Error fetching icons from ${table}:`, error);
        continue;
      }

      const icons: Record<string, string> = {};
      (data as any[])?.forEach((item: { id: string; image_url: string }) => {
        if (item.image_url) icons[item.id] = item.image_url;
      });

      if (Object.keys(icons).length > 0) {
        return icons;
      }
    }
  } catch (err) {
    console.error("Exception loading icons:", err);
  }

  return getLocalGameIcons();
}

export async function getGameProfiles(): Promise<Record<string, GameProfile>> {
  try {
    for (const table of GAME_TABLES) {
      const { data, error } = await supabase
        .from(table as any)
        .select("id, title, emoji, gradient");

      if (error) {
        console.error(`Error fetching profiles from ${table}:`, error);
        continue;
      }

      const profiles: Record<string, GameProfile> = {};
      (data as any[])?.forEach(
        (item: {
          id: string;
          title: string;
          emoji?: string | null;
          gradient?: string | null;
        }) => {
          profiles[item.id] = {
            title: item.title,
            emoji: item.emoji ?? undefined,
            gradient: item.gradient ?? undefined,
          };
        }
      );

      return profiles;
    }
  } catch (err) {
    console.error("Exception loading game profiles:", err);
  }

  return getLocalGameProfiles();
}

// Synchronous version for backward compatibility
export function getGameCoversSync(): Record<string, string> {
  return getLocalGameCovers();
}

export async function saveGameCover(
  gameId: string,
  imageUrl: string
): Promise<boolean> {
  // Always save to localStorage first for immediate display
  const covers = getLocalGameCovers();
  covers[gameId] = imageUrl;

  try {
    localStorage.setItem(GAME_COVERS_KEY, JSON.stringify(covers));
    console.log(`💾 Saved ${gameId} to localStorage`);
  } catch (error) {
    // If quota exceeded, try to save just this one game
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn(`⚠️ LocalStorage quota exceeded, saving only ${gameId}`);
      try {
        localStorage.setItem(
          GAME_COVERS_KEY,
          JSON.stringify({ [gameId]: imageUrl })
        );
      } catch {
        console.error("❌ Failed to save even single game cover");
        return false;
      }
    } else {
      console.error("❌ Error saving to localStorage:", error);
      return false;
    }
  }

  try {
    for (const table of GAME_TABLES) {
      const { error } = await supabase.from(table as any).upsert(
        {
          id: gameId,
          cover_url: imageUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (!error) {
        try {
          const localCovers = getLocalGameCovers();
          delete localCovers[gameId];
          if (Object.keys(localCovers).length > 0) {
            localStorage.setItem(GAME_COVERS_KEY, JSON.stringify(localCovers));
          } else {
            localStorage.removeItem(GAME_COVERS_KEY);
          }
        } catch {
          // ignore cleanup errors
        }
        return true;
      }

      console.error(`Error saving ${gameId} to ${table}:`, error);
    }
  } catch (err) {
    console.error("Exception saving game cover:", err);
    // Already saved to localStorage or single game mode
    return true;
  }
}

export async function saveGameIcon(
  gameId: string,
  imageUrl: string
): Promise<boolean> {
  const icons = getLocalGameIcons();
  icons[gameId] = imageUrl;

  try {
    for (const table of GAME_TABLES) {
      const { error } = await supabase.from(table as any).upsert(
        {
          id: gameId,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (!error) {
        try {
          delete icons[gameId];
          if (Object.keys(icons).length > 0) {
            localStorage.setItem(GAME_ICONS_KEY, JSON.stringify(icons));
          } else {
            localStorage.removeItem(GAME_ICONS_KEY);
          }
        } catch {
          // ignore cleanup errors
        }
        return true;
      }

      console.error(`Error saving icon for ${gameId} to ${table}:`, error);
    }
  } catch (err) {
    console.error("Error saving game icon:", err);
  }

  try {
    localStorage.setItem(GAME_ICONS_KEY, JSON.stringify(icons));
    return true;
  } catch (err) {
    console.error("Error saving game icon to localStorage:", err);
    return false;
  }
}

export async function removeGameIcon(gameId: string): Promise<boolean> {
  try {
    for (const table of GAME_TABLES) {
      const { error } = await supabase
        .from(table as any)
        .update({ image_url: null, updated_at: new Date().toISOString() })
        .eq("id", gameId);

      if (!error) {
        try {
          const icons = getLocalGameIcons();
          delete icons[gameId];
          if (Object.keys(icons).length > 0) {
            localStorage.setItem(GAME_ICONS_KEY, JSON.stringify(icons));
          } else {
            localStorage.removeItem(GAME_ICONS_KEY);
          }
        } catch {
          // ignore cleanup errors
        }
        return true;
      }

      console.error(`Error removing game icon in ${table}:`, error);
    }
  } catch (err) {
    console.error("Error removing game icon:", err);
  }

  return false;
}

export async function clearAllGameIcons(): Promise<boolean> {
  try {
    for (const table of GAME_TABLES) {
      const { error } = await supabase
        .from(table as any)
        .update({ image_url: null, updated_at: new Date().toISOString() })
        .not("image_url", "is", null);

      if (!error) {
        localStorage.removeItem(GAME_ICONS_KEY);
        return true;
      }

      console.error(`Error clearing icons in ${table}:`, error);
    }
  } catch (err) {
    console.error("Error clearing game icons:", err);
  }

  return false;
}

export async function saveGameProfile(
  gameId: string,
  profile: GameProfile
): Promise<boolean> {
  const profiles = getLocalGameProfiles();
  profiles[gameId] = profile;

  try {
    localStorage.setItem(GAME_PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error("❌ Error saving profile to localStorage:", error);
  }

  try {
    for (const table of GAME_TABLES) {
      const { error } = await supabase.from(table as any).upsert(
        {
          id: gameId,
          title: profile.title,
          emoji: profile.emoji ?? null,
          gradient: profile.gradient ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (!error) {
        try {
          const localProfiles = getLocalGameProfiles();
          delete localProfiles[gameId];
          if (Object.keys(localProfiles).length > 0) {
            localStorage.setItem(
              GAME_PROFILES_KEY,
              JSON.stringify(localProfiles)
            );
          } else {
            localStorage.removeItem(GAME_PROFILES_KEY);
          }
        } catch {
          // ignore cleanup errors
        }

        return true;
      }

      console.error(`Error saving profile for ${gameId} to ${table}:`, error);
    }
  } catch (err) {
    console.error("Exception saving game profile:", err);
    return false;
  }
}

export async function resetGameProfile(
  gameId: string,
  defaults: GameProfile
): Promise<boolean> {
  try {
    for (const table of GAME_TABLES) {
      const { error } = await supabase
        .from(table as any)
        .update({
          title: defaults.title,
          emoji: defaults.emoji ?? null,
          gradient: defaults.gradient ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (!error) {
        const profiles = getLocalGameProfiles();
        delete profiles[gameId];
        if (Object.keys(profiles).length > 0) {
          localStorage.setItem(GAME_PROFILES_KEY, JSON.stringify(profiles));
        } else {
          localStorage.removeItem(GAME_PROFILES_KEY);
        }

        return true;
      }

      console.error(
        `Error resetting profile for ${gameId} in ${table}:`,
        error
      );
    }
  } catch (err) {
    console.error("Exception resetting game profile:", err);
    return false;
  }
}

export async function removeGameCover(gameId: string): Promise<boolean> {
  try {
    for (const table of GAME_TABLES) {
      const { error } = await supabase
        .from(table as any)
        .update({
          cover_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      if (!error) return true;

      console.error(`Error removing game cover in ${table}:`, error);
    }
  } catch {
    // ignore
  }

  return false;
}

export async function clearAllGameCovers(): Promise<boolean> {
  try {
    for (const table of GAME_TABLES) {
      const { error } = await supabase
        .from(table as any)
        .update({
          cover_url: null,
          updated_at: new Date().toISOString(),
        })
        .not("cover_url", "is", null);

      if (!error) {
        localStorage.removeItem(GAME_COVERS_KEY);
        return true;
      }

      console.error(`Error clearing covers in ${table}:`, error);
    }
  } catch {
    // ignore
  }

  return false;
}
