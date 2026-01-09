/**
 * Error Handler Utilities
 * Centralized error handling and user-friendly messages
 */

import { ApiError } from "@/lib/api/roomsApi";
import { ERROR_CODES } from "@/lib/api/config";

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.errorCode) {
      case ERROR_CODES.DUPLICATE_CODE:
        return "รหัสห้องนี้มีผู้ใช้แล้ว กรุณาลองอีกครั้ง";
      case ERROR_CODES.ROOM_NOT_FOUND:
        return "ไม่พบห้อง หรือห้องถูกปิดแล้ว";
      case ERROR_CODES.PLAYER_NOT_FOUND:
        return "ไม่พบผู้เล่น";
      case ERROR_CODES.NETWORK_ERROR:
        return "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง";
      default:
        return error.message || "เกิดข้อผิดพลาด";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}

/**
 * Log error with context
 */
export function logError(context: string, error: unknown): void {
  console.error(`❌ [${context}]`, error);

  if (error instanceof ApiError) {
    console.error(`  Status: ${error.statusCode}`);
    console.error(`  Code: ${error.errorCode}`);
  }
}
