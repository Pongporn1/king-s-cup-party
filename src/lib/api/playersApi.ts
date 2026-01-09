/**
 * Players API Service
 * Centralized API calls for player management
 */

import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS, ERROR_CODES } from "./config";
import type {
  CreatePlayerParams,
  CreatePlayerResponse,
  Player,
} from "@/lib/types/players";
import { ApiError } from "./roomsApi";

/**
 * Create a new player
 */
export async function createPlayer(
  params: CreatePlayerParams
): Promise<CreatePlayerResponse> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PLAYERS}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.error || "Failed to create player",
        response.status,
        error.code
      );
    }

    const data: CreatePlayerResponse = await response.json();
    console.log(`✅ Player created: ${params.name}`);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Network error creating player:", error);
    throw new ApiError(
      "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      undefined,
      ERROR_CODES.NETWORK_ERROR
    );
  }
}

/**
 * Get all players in a room
 */
export async function getPlayersByRoomId(roomId: string): Promise<Player[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ROOMS}/${roomId}/players`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.error || "Failed to get players",
        response.status
      );
    }

    const players: Player[] = await response.json();

    // Parse JSON fields if needed
    return players.map((player) => {
      if ("cards" in player && typeof player.cards === "string") {
        player.cards = JSON.parse(player.cards);
      }
      return player;
    });
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
 * Get player by ID
 */
export async function getPlayerById(playerId: string): Promise<Player | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PLAYERS}/${playerId}`
    );

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.error || "Failed to get player",
        response.status
      );
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
 * Update player
 */
export async function updatePlayer(
  playerId: string,
  updates: Partial<Player>
): Promise<void> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PLAYERS}/${playerId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.error || "Failed to update player",
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
 * Delete player
 */
export async function deletePlayer(playerId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PLAYERS}/${playerId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.error || "Failed to delete player",
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
