/**
 * Rooms API Service
 * Centralized API calls for room management
 */

import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS, ERROR_CODES } from "./config";
import type {
  CreateRoomParams,
  CreateRoomResponse,
  Room,
} from "@/lib/types/rooms";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Create a new room with retry logic for duplicate codes
 */
export async function createRoom(
  params: CreateRoomParams,
  maxRetries: number = API_CONFIG.MAX_RETRIES
): Promise<CreateRoomResponse> {
  let attempts = 0;

  while (attempts < maxRetries) {
    attempts++;

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ROOMS}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );

      // Room code already exists, retry with new code
      if (response.status === HTTP_STATUS.CONFLICT) {
        const error = await response.json();
        if (error.code === ERROR_CODES.DUPLICATE_CODE) {
          console.log(
            `🔄 Room code ${params.code} already exists, retry ${attempts}/${maxRetries}`
          );
          continue; // Let caller generate new code
        }
      }

      // Other errors
      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.error || "Failed to create room",
          response.status,
          error.code
        );
      }

      const data: CreateRoomResponse = await response.json();
      console.log(`✅ Room created successfully: ${data.code}`);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error("Network error creating room:", error);
      throw new ApiError(
        "เกิดข้อผิดพลาดในการเชื่อมต่อ",
        undefined,
        ERROR_CODES.NETWORK_ERROR
      );
    }
  }

  throw new ApiError(
    "ไม่สามารถสร้างห้องได้หลังจากพยายามหลายครั้ง",
    undefined,
    ERROR_CODES.DUPLICATE_CODE
  );
}

/**
 * Get room by code
 */
export async function getRoomByCode(code: string): Promise<Room | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ROOMS}/${code.toUpperCase()}`
    );

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error || "Failed to get room", response.status);
    }

    const room: Room = await response.json();

    // Parse JSON fields if needed
    if ("deck" in room && typeof room.deck === "string") {
      room.deck = JSON.parse(room.deck);
    }
    if ("current_card" in room && typeof room.current_card === "string") {
      room.current_card = JSON.parse(room.current_card);
    }
    if ("game_state" in room && typeof room.game_state === "string") {
      room.game_state = JSON.parse(room.game_state);
    }

    return room;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Network error getting room:", error);
    throw new ApiError(
      "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      undefined,
      ERROR_CODES.NETWORK_ERROR
    );
  }
}

/**
 * Get room by ID
 */
export async function getRoomById(id: string): Promise<Room | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ROOMS}/${id}`
    );

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error || "Failed to get room", response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      undefined,
      ERROR_CODES.NETWORK_ERROR
    );
  }
}

/**
 * Update room
 */
export async function updateRoom(
  roomId: string,
  updates: Partial<Room>
): Promise<void> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ROOMS}/${roomId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.error || "Failed to update room",
        response.status
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      undefined,
      ERROR_CODES.NETWORK_ERROR
    );
  }
}

/**
 * Delete room
 */
export async function deleteRoom(roomId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ROOMS}/${roomId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.error || "Failed to delete room",
        response.status
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      undefined,
      ERROR_CODES.NETWORK_ERROR
    );
  }
}
