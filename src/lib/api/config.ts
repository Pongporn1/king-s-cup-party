/**
 * API Configuration
 * Centralized API configuration for the entire application
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  TIMEOUT: 30000,
  MAX_RETRIES: 5,
} as const;

export const API_ENDPOINTS = {
  ROOMS: "/api/rooms",
  PLAYERS: "/api/players",
  FLOATING_NAMES: "/api/floating-names",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_CODES = {
  DUPLICATE_CODE: "DUPLICATE_CODE",
  ROOM_NOT_FOUND: "ROOM_NOT_FOUND",
  PLAYER_NOT_FOUND: "PLAYER_NOT_FOUND",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;
