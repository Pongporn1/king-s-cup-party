// MySQL-backed Supabase-compatible client
// This provides a Supabase-like interface that uses MySQL API instead

import socketClient from "@/lib/socketClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Subscription = { unsubscribe: () => void };

// Helper function to convert table names from underscore to dash for API endpoints
const toApiEndpoint = (table: string) => table.replace(/_/g, "-");

// Create a mock Supabase client that uses MySQL API
function createMockClient() {
  const channels = new Map<string, { unsubscribe: () => void }>();

  return {
    from: (table: string) => ({
      select: (columns = "*") => ({
        eq: (col: string, val: any) => ({
          eq: (col2: string, val2: any) => ({
            single: async () => {
              try {
                const endpoint =
                  table === "rooms" && col === "code"
                    ? `${API_URL}/api/rooms/${val}`
                    : `${API_URL}/api/${toApiEndpoint(table)}`;
                const res = await fetch(endpoint);
                if (!res.ok)
                  return { data: null, error: new Error("Not found") };
                const data = await res.json();
                return { data, error: null };
              } catch (e) {
                return { data: null, error: e };
              }
            },
            async then(resolve: any) {
              const result = await this.single();
              resolve(result);
            },
          }),
          single: async () => {
            try {
              const endpoint =
                table === "rooms" && col === "code"
                  ? `${API_URL}/api/rooms/${val}`
                  : `${API_URL}/api/${toApiEndpoint(table)}`;
              const res = await fetch(endpoint);
              if (!res.ok) return { data: null, error: new Error("Not found") };
              const data = await res.json();
              return { data, error: null };
            } catch (e) {
              return { data: null, error: e };
            }
          },
          async then(resolve: any) {
            try {
              const res = await fetch(
                `${API_URL}/api/${
                  table === "rooms" && col === "room_id"
                    ? `rooms/${val}/players`
                    : toApiEndpoint(table)
                }`
              );
              const data = await res.json();
              resolve({
                data: Array.isArray(data) ? data : [data],
                error: null,
              });
            } catch (e) {
              resolve({ data: [], error: e });
            }
          },
        }),
        order: () => ({
          async then(resolve: any) {
            try {
              const res = await fetch(`${API_URL}/api/${toApiEndpoint(table)}`);
              const data = await res.json();
              resolve({ data: Array.isArray(data) ? data : [], error: null });
            } catch (e) {
              resolve({ data: [], error: e });
            }
          },
        }),
        async then(resolve: any) {
          try {
            const res = await fetch(`${API_URL}/api/${toApiEndpoint(table)}`);
            const data = await res.json();
            resolve({ data: Array.isArray(data) ? data : [], error: null });
          } catch (e) {
            resolve({ data: [], error: e });
          }
        },
      }),
      insert: (row: any) => ({
        select: () => ({
          single: async () => {
            try {
              const id = row.id || crypto.randomUUID();
              const res = await fetch(
                `${API_URL}/api/${table === "rooms" ? "rooms" : "players"}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...row, id }),
                }
              );
              if (!res.ok)
                return { data: null, error: new Error("Insert failed") };
              return { data: { ...row, id }, error: null };
            } catch (e) {
              return { data: null, error: e };
            }
          },
        }),
      }),
      update: (data: any) => ({
        eq: (col: string, val: any) => ({
          eq: (col2: string, val2: any) => ({
            async then(resolve: any) {
              try {
                await fetch(`${API_URL}/api/${toApiEndpoint(table)}/${val}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                resolve({ error: null });
              } catch (e) {
                resolve({ error: e });
              }
            },
          }),
          async then(resolve: any) {
            try {
              await fetch(`${API_URL}/api/${toApiEndpoint(table)}/${val}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              resolve({ error: null, data: null });
            } catch (e) {
              resolve({ error: e });
            }
          },
        }),
      }),
      delete: () => ({
        eq: (col: string, val: any) => ({
          async then(resolve: any) {
            try {
              await fetch(`${API_URL}/api/${toApiEndpoint(table)}/${val}`, {
                method: "DELETE",
              });
              resolve({ error: null });
            } catch (e) {
              resolve({ error: e });
            }
          },
        }),
        in: (col: string, vals: any[]) => ({
          async then(resolve: any) {
            try {
              for (const val of vals) {
                await fetch(`${API_URL}/api/${toApiEndpoint(table)}/${val}`, {
                  method: "DELETE",
                });
              }
              resolve({ error: null });
            } catch (e) {
              resolve({ error: e });
            }
          },
        }),
      }),
    }),
    channel: (name: string) => {
      const callbacks: { event: string; callback: (payload: any) => void }[] =
        [];
      let roomCode: string | null = null;

      // Extract room ID from channel name (e.g., "room-abc123")
      const match = name.match(/room-([a-zA-Z0-9-]+)/);
      if (match) roomCode = match[1];

      const channel = {
        on: (event: string, filter: any, callback: (payload: any) => void) => {
          callbacks.push({ event, callback });
          return channel;
        },
        subscribe: (statusCallback?: (status: string) => void) => {
          if (roomCode) {
            socketClient.joinRoom(roomCode);

            // Map Socket.IO events to Supabase-like payloads
            socketClient.on("room-changed", (data: any) => {
              callbacks.forEach(({ callback }) =>
                callback({ eventType: "UPDATE", new: data })
              );
            });
            socketClient.on("player-joined", (data: any) => {
              callbacks.forEach(({ callback }) =>
                callback({ eventType: "INSERT", new: data })
              );
            });
            socketClient.on("player-left", (data: any) => {
              callbacks.forEach(({ callback }) =>
                callback({ eventType: "DELETE", old: { id: data.playerId } })
              );
            });
            socketClient.on("player-changed", (data: any) => {
              callbacks.forEach(({ callback }) =>
                callback({ eventType: "UPDATE", new: data })
              );
            });
          }

          if (statusCallback) {
            setTimeout(() => statusCallback("SUBSCRIBED"), 100);
          }
          return channel;
        },
      };

      channels.set(name, {
        unsubscribe: () => {
          if (roomCode) socketClient.leaveRoom(roomCode);
        },
      });

      return channel;
    },
    removeChannel: (channel: any) => {
      // Cleanup handled by channel.unsubscribe
    },
    functions: {
      invoke: async <T>(name: string, options: { body: any }) => {
        try {
          const res = await fetch(`${API_URL}/api/${name.replace("-", "/")}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(options.body),
          });
          const data = await res.json();
          return { data: data as T, error: null };
        } catch (e) {
          return { data: null, error: e };
        }
      },
    },
    realtime: {
      connect: () => {
        socketClient.connect();
        return Promise.resolve();
      },
    },
  };
}

export const supabase = createMockClient();
