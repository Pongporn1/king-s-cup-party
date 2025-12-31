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
  // Always get from localStorage first (has base64 data)
  const localCovers = getLocalGameCovers();
  console.log(`📦 LocalStorage covers:`, Object.keys(localCovers));

  // Return localStorage data directly - base64 data is too large for Supabase
  // Supabase is only used for backup/sync of URL-based covers
  if (Object.keys(localCovers).length > 0) {
    return localCovers;
  }

  try {
    const { data, error } = await supabase
      .from("game_covers" as any)
      .select("id, cover_url")
      .not("cover_url", "is", null);

    if (error) {
      console.error("Error fetching game covers:", error);
      return localCovers;
    }

    // Only use Supabase data if localStorage is empty
    const covers: Record<string, string> = {};
    (data as any[])?.forEach((item: { id: string; cover_url: string }) => {
      if (item.cover_url) {
        covers[item.id] = item.cover_url;
      }
    });

    console.log(`📦 Supabase covers:`, Object.keys(covers));
    return covers;
  } catch {
    return localCovers;
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
  // Always save to localStorage first for immediate display
  const covers = getLocalGameCovers();
  covers[gameId] = imageUrl;
  localStorage.setItem(GAME_COVERS_KEY, JSON.stringify(covers));
  console.log(`💾 Saved ${gameId} to localStorage`);

  try {
    // Use upsert to handle both insert and update cases
    const { error } = await supabase.from("game_covers" as any).upsert(
      {
        id: gameId,
        cover_url: imageUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Error saving game cover to Supabase:", error);
      // Already saved to localStorage, so return true anyway
      return true;
    }

    console.log(`✅ Saved ${gameId} to Supabase`);
    return true;
  } catch (err) {
    console.error("Exception saving game cover:", err);
    // Already saved to localStorage
    return true;
  }
}

export async function removeGameCover(gameId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("game_covers" as any)
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
      .from("game_covers" as any)
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
