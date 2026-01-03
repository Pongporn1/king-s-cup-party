// MySQL Database Connection for King's Cup Party
// This replaces Supabase with a local MySQL database

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    return null;
  }
}

// Game covers/icons/profiles
export async function getGameCovers(): Promise<Record<string, string>> {
  const data = await apiCall<Array<{ id: string; cover_url: string }>>(
    "/api/games?field=cover_url"
  );
  if (!data) return getLocalGameCovers();

  const covers: Record<string, string> = {};
  data.forEach((item) => {
    if (item.cover_url) covers[item.id] = item.cover_url;
  });
  return covers;
}

export async function getGameIcons(): Promise<Record<string, string>> {
  const data = await apiCall<Array<{ id: string; image_url: string }>>(
    "/api/games?field=image_url"
  );
  if (!data) return getLocalGameIcons();

  const icons: Record<string, string> = {};
  data.forEach((item) => {
    if (item.image_url) icons[item.id] = item.image_url;
  });
  return icons;
}

export interface GameProfile {
  title: string;
  emoji?: string | null;
  gradient?: string | null;
}

export async function getGameProfiles(): Promise<Record<string, GameProfile>> {
  const data = await apiCall<
    Array<{ id: string; title: string; emoji?: string; gradient?: string }>
  >("/api/games");
  if (!data) return getLocalGameProfiles();

  const profiles: Record<string, GameProfile> = {};
  data.forEach((item) => {
    profiles[item.id] = {
      title: item.title,
      emoji: item.emoji,
      gradient: item.gradient,
    };
  });
  return profiles;
}

export async function saveGameCover(
  gameId: string,
  imageUrl: string
): Promise<boolean> {
  console.log(`💾 Saving cover for ${gameId}`);

  // Save to localStorage first for immediate display
  const covers = getLocalGameCovers();
  covers[gameId] = imageUrl;
  saveLocalGameCovers(covers);

  // Try to save to MySQL
  const result = await apiCall(`/api/games/${gameId}`, {
    method: "PUT",
    body: JSON.stringify({ cover_url: imageUrl }),
  });

  if (result) {
    console.log(`✅ Saved cover for ${gameId} to MySQL`);
    // Clear localStorage since MySQL succeeded
    const localCovers = getLocalGameCovers();
    delete localCovers[gameId];
    if (Object.keys(localCovers).length > 0) {
      saveLocalGameCovers(localCovers);
    } else {
      localStorage.removeItem(GAME_COVERS_KEY);
    }
    return true;
  }

  console.log(`⚠️ MySQL failed, using localStorage for ${gameId}`);
  return true; // Still return true because localStorage succeeded
}

export async function saveGameIcon(
  gameId: string,
  imageUrl: string
): Promise<boolean> {
  console.log(`🎨 Saving icon for ${gameId}`);

  // Save to localStorage first
  const icons = getLocalGameIcons();
  icons[gameId] = imageUrl;
  saveLocalGameIcons(icons);

  // Try to save to MySQL
  const result = await apiCall(`/api/games/${gameId}`, {
    method: "PUT",
    body: JSON.stringify({ image_url: imageUrl }),
  });

  if (result) {
    console.log(`✅ Saved icon for ${gameId} to MySQL`);
    const localIcons = getLocalGameIcons();
    delete localIcons[gameId];
    if (Object.keys(localIcons).length > 0) {
      saveLocalGameIcons(localIcons);
    } else {
      localStorage.removeItem(GAME_ICONS_KEY);
    }
    return true;
  }

  console.log(`⚠️ MySQL failed, using localStorage for ${gameId}`);
  return true;
}

export async function saveGameProfile(
  gameId: string,
  profile: GameProfile
): Promise<boolean> {
  const result = await apiCall(`/api/games/${gameId}`, {
    method: "PUT",
    body: JSON.stringify({
      title: profile.title,
      emoji: profile.emoji,
      gradient: profile.gradient,
    }),
  });

  if (result) {
    console.log(`✅ Saved profile for ${gameId}`);
    return true;
  }

  // Fallback to localStorage
  const profiles = getLocalGameProfiles();
  profiles[gameId] = profile;
  saveLocalGameProfiles(profiles);
  return true;
}

export async function removeGameCover(gameId: string): Promise<boolean> {
  const result = await apiCall(`/api/games/${gameId}`, {
    method: "PUT",
    body: JSON.stringify({ cover_url: null }),
  });
  return !!result;
}

export async function removeGameIcon(gameId: string): Promise<boolean> {
  const result = await apiCall(`/api/games/${gameId}`, {
    method: "PUT",
    body: JSON.stringify({ image_url: null }),
  });
  return !!result;
}

export async function clearAllGameCovers(): Promise<boolean> {
  const result = await apiCall("/api/games/clear-covers", { method: "POST" });
  localStorage.removeItem(GAME_COVERS_KEY);
  return !!result;
}

export async function clearAllGameIcons(): Promise<boolean> {
  const result = await apiCall("/api/games/clear-icons", { method: "POST" });
  localStorage.removeItem(GAME_ICONS_KEY);
  return !!result;
}

// Floating names
export async function getFloatingNamesFromDB(): Promise<string[]> {
  const data = await apiCall<Array<{ name: string }>>("/api/floating-names");
  if (!data) return getLocalNames();
  return data.map((item) => item.name);
}

export async function addFloatingName(name: string): Promise<boolean> {
  const result = await apiCall("/api/floating-names", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  if (!result) {
    const names = getLocalNames();
    names.push(name);
    saveLocalNames(names);
    return false;
  }
  return true;
}

export async function removeFloatingName(name: string): Promise<boolean> {
  const result = await apiCall(
    `/api/floating-names/${encodeURIComponent(name)}`,
    {
      method: "DELETE",
    }
  );
  return !!result;
}

export async function clearAllFloatingNames(): Promise<boolean> {
  const result = await apiCall("/api/floating-names", { method: "DELETE" });
  saveLocalNames([]);
  return !!result;
}

// LocalStorage fallback keys
const STORAGE_KEY = "admin_floating_names";
const GAME_COVERS_KEY = "admin_game_covers";
const GAME_ICONS_KEY = "admin_game_icons";
const GAME_PROFILES_KEY = "admin_game_profiles";

// LocalStorage helpers
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

function getLocalGameCovers(): Record<string, string> {
  try {
    const stored = localStorage.getItem(GAME_COVERS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveLocalGameCovers(covers: Record<string, string>) {
  try {
    localStorage.setItem(GAME_COVERS_KEY, JSON.stringify(covers));
  } catch (e) {
    console.error("Failed to save covers to localStorage:", e);
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

function saveLocalGameIcons(icons: Record<string, string>) {
  try {
    localStorage.setItem(GAME_ICONS_KEY, JSON.stringify(icons));
  } catch (e) {
    console.error("Failed to save icons to localStorage:", e);
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

function saveLocalGameProfiles(profiles: Record<string, GameProfile>) {
  try {
    localStorage.setItem(GAME_PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error("Failed to save profiles to localStorage:", e);
  }
}

// Backward compatibility exports
export function getFloatingNames(): string[] {
  return getLocalNames();
}

export function saveFloatingNames(names: string[]) {
  saveLocalNames(names);
}

export function getGameCoversSync(): Record<string, string> {
  return getLocalGameCovers();
}

export async function resetGameProfile(
  gameId: string,
  defaults: GameProfile
): Promise<boolean> {
  return saveGameProfile(gameId, defaults);
}
