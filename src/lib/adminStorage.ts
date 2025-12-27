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
