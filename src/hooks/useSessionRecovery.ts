import { useState, useEffect, useCallback } from "react";

interface SessionData {
  playerId: string | null;
  playerName: string | null;
  roomCode: string | null;
  gameType: string | null;
  avatar: number | null;
}

const SESSION_KEYS = {
  PLAYER_ID: "kcp_player_id",
  PLAYER_NAME: "kcp_player_name",
  ROOM_CODE: "kcp_room_code",
  GAME_TYPE: "kcp_game_type",
  AVATAR: "kcp_avatar",
} as const;

// Generate UUID for player
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useSessionRecovery() {
  const [sessionData, setSessionData] = useState<SessionData>({
    playerId: null,
    playerName: null,
    roomCode: null,
    gameType: null,
    avatar: null,
  });
  const [isRecovering, setIsRecovering] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Load session from localStorage and URL on mount
  useEffect(() => {
    const loadSession = () => {
      // Get room code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const roomFromUrl = urlParams.get("room");
      const gameFromUrl = urlParams.get("game");

      // Get data from localStorage
      const playerId = localStorage.getItem(SESSION_KEYS.PLAYER_ID);
      const playerName = localStorage.getItem(SESSION_KEYS.PLAYER_NAME);
      const roomCode =
        roomFromUrl || localStorage.getItem(SESSION_KEYS.ROOM_CODE);
      const gameType =
        gameFromUrl || localStorage.getItem(SESSION_KEYS.GAME_TYPE);
      const avatarStr = localStorage.getItem(SESSION_KEYS.AVATAR);
      const avatar = avatarStr ? parseInt(avatarStr, 10) : null;

      const data: SessionData = {
        playerId,
        playerName,
        roomCode,
        gameType,
        avatar,
      };

      setSessionData(data);

      // Has valid session if we have player ID, room code, and game type
      const valid = !!(playerId && roomCode && gameType);
      setHasSession(valid);
      setIsRecovering(false);

      if (valid) {
        console.log("Session found:", { roomCode, gameType, playerName });
      }
    };

    loadSession();
  }, []);

  // Save session to localStorage and update URL
  const saveSession = useCallback(
    (data: Partial<SessionData>) => {
      const newData = { ...sessionData, ...data };

      // Ensure player ID exists
      if (!newData.playerId) {
        newData.playerId = generateUUID();
      }

      // Save to localStorage
      if (newData.playerId) {
        localStorage.setItem(SESSION_KEYS.PLAYER_ID, newData.playerId);
      }
      if (newData.playerName) {
        localStorage.setItem(SESSION_KEYS.PLAYER_NAME, newData.playerName);
      }
      if (newData.roomCode) {
        localStorage.setItem(SESSION_KEYS.ROOM_CODE, newData.roomCode);
      }
      if (newData.gameType) {
        localStorage.setItem(SESSION_KEYS.GAME_TYPE, newData.gameType);
      }
      if (newData.avatar !== null && newData.avatar !== undefined) {
        localStorage.setItem(SESSION_KEYS.AVATAR, newData.avatar.toString());
      }

      // Update URL with room code and game type
      if (newData.roomCode && newData.gameType) {
        const url = new URL(window.location.href);
        url.searchParams.set("room", newData.roomCode);
        url.searchParams.set("game", newData.gameType);
        window.history.replaceState({}, "", url.toString());
      }

      setSessionData(newData);
      setHasSession(
        !!(newData.playerId && newData.roomCode && newData.gameType)
      );
    },
    [sessionData]
  );

  // Clear session
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEYS.PLAYER_ID);
    localStorage.removeItem(SESSION_KEYS.PLAYER_NAME);
    localStorage.removeItem(SESSION_KEYS.ROOM_CODE);
    localStorage.removeItem(SESSION_KEYS.GAME_TYPE);
    localStorage.removeItem(SESSION_KEYS.AVATAR);

    // Clear URL params
    const url = new URL(window.location.href);
    url.searchParams.delete("room");
    url.searchParams.delete("game");
    window.history.replaceState({}, "", url.pathname);

    setSessionData({
      playerId: null,
      playerName: null,
      roomCode: null,
      gameType: null,
      avatar: null,
    });
    setHasSession(false);
  }, []);

  // Get or create player ID
  const getOrCreatePlayerId = useCallback((): string => {
    let playerId = localStorage.getItem(SESSION_KEYS.PLAYER_ID);
    if (!playerId) {
      playerId = generateUUID();
      localStorage.setItem(SESSION_KEYS.PLAYER_ID, playerId);
    }
    return playerId;
  }, []);

  return {
    sessionData,
    isRecovering,
    hasSession,
    saveSession,
    clearSession,
    getOrCreatePlayerId,
  };
}

// Helper function to check if there's a session to recover
export function hasRecoverableSession(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const roomFromUrl = urlParams.get("room");
  const gameFromUrl = urlParams.get("game");
  const playerId = localStorage.getItem(SESSION_KEYS.PLAYER_ID);
  const roomCode = roomFromUrl || localStorage.getItem(SESSION_KEYS.ROOM_CODE);
  const gameType = gameFromUrl || localStorage.getItem(SESSION_KEYS.GAME_TYPE);

  return !!(playerId && roomCode && gameType);
}

// Get session data synchronously (for initial load)
export function getSessionData(): SessionData {
  const urlParams = new URLSearchParams(window.location.search);
  const roomFromUrl = urlParams.get("room");
  const gameFromUrl = urlParams.get("game");

  return {
    playerId: localStorage.getItem(SESSION_KEYS.PLAYER_ID),
    playerName: localStorage.getItem(SESSION_KEYS.PLAYER_NAME),
    roomCode: roomFromUrl || localStorage.getItem(SESSION_KEYS.ROOM_CODE),
    gameType: gameFromUrl || localStorage.getItem(SESSION_KEYS.GAME_TYPE),
    avatar: (() => {
      const str = localStorage.getItem(SESSION_KEYS.AVATAR);
      return str ? parseInt(str, 10) : null;
    })(),
  };
}
