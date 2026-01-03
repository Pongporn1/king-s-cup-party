// Room cleanup utility - Uses MySQL API instead of Supabase

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const ROOM_MAX_AGE = 3 * 60 * 60 * 1000; // 3 hours
const TEST_MAX_AGE = 5 * 60 * 1000; // 5 minutes
const TEST_MODE = import.meta.env.VITE_ROOM_CLEANUP_TEST_MODE === "true";
const ACTUAL_MAX_AGE = TEST_MODE ? TEST_MAX_AGE : ROOM_MAX_AGE;

type CleanupResult =
  | {
      ok: true;
      deletedCount: number;
      deletedCodes: string[];
    }
  | { ok: false; error: string };

/**
 * Cleanup rooms older than configured max age (default 3 hours, or 5 min in test mode)
 */
export async function cleanupOldRooms(): Promise<CleanupResult | undefined> {
  try {
    const maxAgeMinutes = Math.floor(ACTUAL_MAX_AGE / 60000);
    console.log(`🧹 Running room cleanup (max age: ${maxAgeMinutes} minutes)...`);

    const response = await fetch(`${API_URL}/api/cleanup-rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testMode: TEST_MODE,
        maxAgeMs: ACTUAL_MAX_AGE,
      }),
    });

    const data: CleanupResult = await response.json();

    if (!data || data.ok === false) {
      console.error("❌ cleanup-rooms returned error:", data);
      return data;
    }

    if (data.deletedCount > 0) {
      console.log(`✅ Cleaned up ${data.deletedCount} old rooms:`, data.deletedCodes);
    } else {
      console.log("✅ No old rooms to clean up");
    }

    return data;
  } catch (error) {
    console.error("❌ Error during room cleanup:", error);
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Cleanup on room creation (opportunistic cleanup)
 */
export async function cleanupOnCreate() {
  await cleanupOldRooms();
}

/**
 * Get all rooms with their age for debugging
 */
export async function getRoomsWithAge() {
  try {
    const response = await fetch(`${API_URL}/api/rooms`);
    if (!response.ok) {
      console.error("❌ Failed to get rooms");
      return [];
    }

    const data = await response.json();
    const now = Date.now();

    const roomsWithAge = (data || []).map((room: { created_at: string; [key: string]: unknown }) => {
      const createdAt = new Date(room.created_at).getTime();
      const ageMs = now - createdAt;
      const ageMinutes = Math.floor(ageMs / 60000);
      const ageHours = Math.floor(ageMinutes / 60);
      return {
        ...room,
        ageMs,
        ageMinutes,
        ageHours,
        willBeDeleted: ageMs > ACTUAL_MAX_AGE,
      };
    });

    console.log("📊 Room ages:", roomsWithAge);
    return roomsWithAge;
  } catch (error) {
    console.error("❌ Error getting rooms:", error);
    return [];
  }
}

// Expose for debugging in console
if (typeof window !== "undefined") {
  (window as unknown as { debugRoomCleanup?: unknown }).debugRoomCleanup = {
    cleanupNow: cleanupOldRooms,
    getRoomsWithAge,
    testMode: TEST_MODE,
    maxAgeMinutes: Math.floor(ACTUAL_MAX_AGE / 60000),
  };
}
