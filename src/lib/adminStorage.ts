import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "admin_floating_names";

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

export interface GameCover {
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

export async function getGameCovers(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from("game_covers")
      .select("id, cover_url")
      .not("cover_url", "is", null);

    if (error) {
      console.error("Error fetching game covers:", error);
      return getLocalGameCovers();
    }

    const covers: Record<string, string> = {};
    data?.forEach((item: { id: string; cover_url: string }) => {
      covers[item.id] = item.cover_url;
    });
    return covers;
  } catch {
    return getLocalGameCovers();
  }
}

// Synchronous version for backward compatibility
export function getGameCoversSync(): Record<string, string> {
  return getLocalGameCovers();
}

export async function saveGameCover(
  gameId: string,
  imageUrl: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("game_covers")
      .update({
        cover_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId);

    if (error) {
      console.error("Error saving game cover:", error);
      // Fallback to localStorage
      const covers = getLocalGameCovers();
      covers[gameId] = imageUrl;
      localStorage.setItem(GAME_COVERS_KEY, JSON.stringify(covers));
      return false;
    }

    return true;
  } catch {
    const covers = getLocalGameCovers();
    covers[gameId] = imageUrl;
    localStorage.setItem(GAME_COVERS_KEY, JSON.stringify(covers));
    return false;
  }
}

export async function removeGameCover(gameId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("game_covers")
      .update({
        cover_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId);

    if (error) {
      console.error("Error removing game cover:", error);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function clearAllGameCovers(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("game_covers")
      .update({
        cover_url: null,
        updated_at: new Date().toISOString(),
      })
      .not("cover_url", "is", null);

    if (error) {
      console.error("Error clearing game covers:", error);
      return false;
    }

    localStorage.removeItem(GAME_COVERS_KEY);
    return true;
  } catch {
    return false;
  }
}
