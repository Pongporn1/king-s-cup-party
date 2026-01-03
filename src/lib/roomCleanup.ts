// Auto cleanup utility for old rooms
import { supabase } from "@/integrations/supabase/client";

const ROOM_MAX_AGE = 3 * 60 * 60 * 1000; // 3 hours
const TEST_MAX_AGE = 5 * 60 * 1000; // 5 minutes
const TEST_MODE = import.meta.env.VITE_ROOM_CLEANUP_TEST_MODE === "true";
const ACTUAL_MAX_AGE = TEST_MODE ? TEST_MAX_AGE : ROOM_MAX_AGE;

type CleanupResult =
  | {
      ok: true;
      deletedCount: number;
      cutoffTime: string;
      deletedCodes: string[];
    }
  | { ok: false; error: string };

/**
 * Cleanup rooms older than configured max age (default 3 hours, or 5 min in test mode)
 */
export async function cleanupOldRooms() {
  try {
    const maxAgeMinutes = Math.floor(ACTUAL_MAX_AGE / 60000);
    console.log(
      `🧹 Running room cleanup (max age: ${maxAgeMinutes} minutes)...`
    );

    // Prefer server-side cleanup via Edge Function (bypasses RLS safely)
    const { data, error } = await supabase.functions.invoke<CleanupResult>(
      "cleanup-rooms",
      {
        body: {
          testMode: TEST_MODE,
          maxAgeMs: ACTUAL_MAX_AGE,
        },
      }
    );

    if (error) {
      console.error("❌ cleanup-rooms invoke failed:", error);
      return;
    }

    if (!data || data.ok === false) {
      console.error("❌ cleanup-rooms returned error:", data);
      return;
    }

    if (data.deletedCount > 0) {
      console.log(
        `✅ Cleaned up ${data.deletedCount} old rooms:`,
        data.deletedCodes
      );
    } else {
      console.log("✅ No old rooms to clean up");
    }

    return data;
  } catch (error) {
    console.error("❌ Error during room cleanup:", error);
  }
}

/**
 * Cleanup on room creation (opportunistic cleanup)
 */
export async function cleanupOnCreate() {
  // Run cleanup when creating a new room (opportunistic)
  await cleanupOldRooms();
}

/**
 * Get all rooms with their age for debugging
 */
export async function getRoomsWithAge() {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("code, created_at, is_active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Failed to get rooms:", error);
      return [];
    }

    const now = Date.now();
    const roomsWithAge = (data || []).map((room) => {
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
