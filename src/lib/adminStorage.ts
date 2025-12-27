const STORAGE_KEY = "admin_floating_names";

export function getFloatingNames(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveFloatingNames(names: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
}
