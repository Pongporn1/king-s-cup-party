// Auto cleanup utility for old rooms
import { supabase } from "@/integrations/supabase/client";

const CLEANUP_INTERVAL = 30 * 60 * 1000; // Run every 30 minutes
const ROOM_MAX_AGE = 3 * 60 * 60 * 1000; // 3 hours

let cleanupIntervalId: NodeJS.Timeout | null = null;

/**
 * Cleanup rooms older than 3 hours
 */
export async function cleanupOldRooms() {
  try {
    console.log("🧹 Running room cleanup...");

    const threeHoursAgo = new Date(Date.now() - ROOM_MAX_AGE).toISOString();

    // Delete old rooms
    const { data, error } = await supabase
      .from("rooms")
      .delete()
      .lt("created_at", threeHoursAgo)
      .select();

    if (error) {
      console.error("❌ Failed to cleanup rooms:", error);
      return;
    }

    if (data && data.length > 0) {
      console.log(`✅ Cleaned up ${data.length} old rooms`);
    } else {
      console.log("✅ No old rooms to clean up");
    }

    return data;
  } catch (error) {
    console.error("❌ Error during room cleanup:", error);
  }
}

/**
 * Start automatic cleanup (runs every 30 minutes)
 */
export function startAutoCleanup() {
  if (cleanupIntervalId) {
    console.log("⚠️ Auto cleanup already running");
    return;
  }

  console.log("🚀 Starting auto cleanup (every 30 minutes)");

  // Run immediately
  cleanupOldRooms();

  // Then run every 30 minutes
  cleanupIntervalId = setInterval(() => {
    cleanupOldRooms();
  }, CLEANUP_INTERVAL);
}

/**
 * Stop automatic cleanup
 */
export function stopAutoCleanup() {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    console.log("🛑 Stopped auto cleanup");
  }
}

/**
 * Cleanup on room creation (opportunistic cleanup)
 */
export async function cleanupOnCreate() {
  // Run cleanup when creating a new room (opportunistic)
  await cleanupOldRooms();
}
