/* eslint-disable @typescript-eslint/no-explicit-any */
// MySQL-backed Supabase-compatible client
import socketClient from "@/lib/socketClient";
import { API_CONFIG } from "@/lib/api/config";

const toApiEndpoint = (table: string) => table.replace(/_/g, "-");

// Helper to create a proper Promise with extra methods
function createQueryPromise<T>(
  executor: () => Promise<T>,
  extras: Record<string, any> = {}
): Promise<T> & Record<string, any> {
  const promise = executor() as Promise<T> & Record<string, any>;
  Object.assign(promise, extras);
  return promise;
}

function createMockClient() {
  const channels = new Map<string, { unsubscribe: () => void }>();

  return {
    from: (table: string) => ({
      select: (columns = "*") => {
        // Create base query builder
        const createEqChain = (
          col: string,
          val: any
        ): Promise<any> & Record<string, any> => {
          const executeQuery = async () => {
            try {
              let endpoint;
              if (table === "players" && col === "room_id") {
                endpoint = `${API_CONFIG.BASE_URL}/api/rooms/${val}/players`;
              } else if (col === "id") {
                endpoint = `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(
                  table
                )}/${val}`;
              } else {
                endpoint = `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(table)}`;
              }
              const res = await fetch(endpoint);
              if (!res.ok) {
                return {
                  data: [],
                  error: new Error(`Failed: ${res.statusText}`),
                };
              }
              const data = await res.json();
              return { data: Array.isArray(data) ? data : [data], error: null };
            } catch (e) {
              return { data: [], error: e };
            }
          };

          // Second .eq() handler
          const createSecondEq = (
            col2: string,
            val2: any
          ): Promise<any> & Record<string, any> => {
            const executeWithFilter = async () => {
              try {
                let endpoint;
                if (table === "rooms" && col === "code") {
                  endpoint = `${API_CONFIG.BASE_URL}/api/rooms/${val}`;
                } else if (table === "players" && col === "room_id") {
                  endpoint = `${API_CONFIG.BASE_URL}/api/rooms/${val}/players`;
                } else {
                  endpoint = `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(
                    table
                  )}`;
                }
                const res = await fetch(endpoint);
                if (!res.ok) {
                  return {
                    data: [],
                    error: new Error(`Failed: ${res.statusText}`),
                  };
                }
                let data = await res.json();
                // Filter by second condition
                if (Array.isArray(data) && col2 && val2 !== undefined) {
                  data = data.filter((item: any) => item[col2] === val2);
                }
                return {
                  data: Array.isArray(data) ? data : [data],
                  error: null,
                };
              } catch (e) {
                return { data: [], error: e };
              }
            };

            return createQueryPromise(executeWithFilter, {
              single: async () => {
                try {
                  let endpoint;
                  if (
                    table === "rooms" &&
                    (col === "code" || col2 === "code")
                  ) {
                    const codeVal = col === "code" ? val : val2;
                    endpoint = `${API_CONFIG.BASE_URL}/api/rooms/${codeVal}`;
                  } else if (col === "id") {
                    endpoint = `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(
                      table
                    )}/${val}`;
                  } else if (col2 === "id") {
                    endpoint = `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(
                      table
                    )}/${val2}`;
                  } else if (table === "players" && col === "room_id") {
                    endpoint = `${API_CONFIG.BASE_URL}/api/rooms/${val}/players`;
                  } else {
                    endpoint = `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(
                      table
                    )}`;
                  }
                  const res = await fetch(endpoint);
                  if (!res.ok)
                    return { data: null, error: new Error("Not found") };
                  const data = await res.json();
                  return { data, error: null };
                } catch (e) {
                  return { data: null, error: e };
                }
              },
            });
          };

          return createQueryPromise(executeQuery, {
            eq: createSecondEq,
            single: async () => {
              try {
                let endpoint;
                if (table === "rooms" && col === "code") {
                  endpoint = `${API_CONFIG.BASE_URL}/api/rooms/${val}`;
                } else if (col === "id") {
                  endpoint = `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(
                    table
                  )}/${val}`;
                } else if (table === "players" && col === "room_id") {
                  endpoint = `${API_CONFIG.BASE_URL}/api/rooms/${val}/players`;
                } else {
                  endpoint = `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(
                    table
                  )}`;
                }
                const res = await fetch(endpoint);
                if (!res.ok)
                  return { data: null, error: new Error("Not found") };
                const data = await res.json();
                return { data, error: null };
              } catch (e) {
                return { data: null, error: e };
              }
            },
            order: (column: string, options?: { ascending?: boolean }) => {
              const executeWithOrder = async () => {
                try {
                  let endpoint;
                  if (table === "players" && col === "room_id") {
                    endpoint = `${API_CONFIG.BASE_URL}/api/rooms/${val}/players`;
                  } else {
                    endpoint = `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(
                      table
                    )}`;
                  }
                  const res = await fetch(endpoint);
                  if (!res.ok) {
                    return {
                      data: [],
                      error: new Error(`Failed: ${res.statusText}`),
                    };
                  }
                  let data = await res.json();
                  if (Array.isArray(data) && column) {
                    const ascending = options?.ascending !== false;
                    data = data.sort((a: any, b: any) => {
                      const valA = a[column];
                      const valB = b[column];
                      if (valA < valB) return ascending ? -1 : 1;
                      if (valA > valB) return ascending ? 1 : -1;
                      return 0;
                    });
                  }
                  return {
                    data: Array.isArray(data) ? data : [data],
                    error: null,
                  };
                } catch (e) {
                  return { data: [], error: e };
                }
              };
              return createQueryPromise(executeWithOrder, {});
            },
          });
        };

        // Select query builder
        const selectQuery = async () => {
          try {
            const res = await fetch(
              `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(table)}`
            );
            const data = await res.json();
            return { data: Array.isArray(data) ? data : [], error: null };
          } catch (e) {
            return { data: [], error: e };
          }
        };

        return createQueryPromise(selectQuery, {
          eq: createEqChain,
          order: () => createQueryPromise(selectQuery, {}),
        });
      },

      insert: (row: any) => ({
        select: () => {
          const executeInsert = async () => {
            try {
              const endpoint = `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(
                table
              )}`;
              const isArray = Array.isArray(row);
              if (isArray) {
                const results = [];
                for (const item of row) {
                  const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item),
                  });
                  if (res.ok) results.push(await res.json());
                }
                return { data: results, error: null };
              } else {
                const res = await fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(row),
                });
                if (!res.ok) {
                  const errorText = await res.text();
                  return {
                    data: null,
                    error: new Error(errorText || "Insert failed"),
                  };
                }
                const data = await res.json();
                return { data: [data], error: null };
              }
            } catch (e) {
              return { data: null, error: e };
            }
          };

          return createQueryPromise(executeInsert, {
            single: async () => {
              try {
                const res = await fetch(
                  `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(table)}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(row),
                  }
                );
                if (!res.ok) {
                  const errorText = await res.text();
                  return {
                    data: null,
                    error: new Error(errorText || "Insert failed"),
                  };
                }
                const data = await res.json();
                return { data, error: null };
              } catch (e) {
                return { data: null, error: e };
              }
            },
          });
        },
      }),

      update: (data: any) => ({
        eq: (col: string, val: any): Promise<any> & Record<string, any> => {
          const executeUpdate = async () => {
            try {
              const res = await fetch(
                `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(table)}/${val}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                }
              );
              if (!res.ok) {
                const errorText = await res.text();
                return { error: new Error(errorText || "Update failed") };
              }
              return { error: null };
            } catch (e) {
              return { error: e };
            }
          };

          return createQueryPromise(executeUpdate, {
            eq: (col2: string, val2: any) =>
              createQueryPromise(executeUpdate, {}),
          });
        },
      }),

      delete: () => ({
        eq: (col: string, val: any): Promise<any> & Record<string, any> => {
          const executeDelete = async () => {
            try {
              const res = await fetch(
                `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(table)}/${val}`,
                {
                  method: "DELETE",
                }
              );
              if (!res.ok) {
                const errorText = await res.text();
                return { error: new Error(errorText || "Delete failed") };
              }
              return { error: null };
            } catch (e) {
              return { error: e };
            }
          };

          return createQueryPromise(executeDelete, {});
        },
        in: (col: string, vals: any[]): Promise<any> & Record<string, any> => {
          const executeDeleteMany = async () => {
            try {
              for (const val of vals) {
                await fetch(
                  `${API_CONFIG.BASE_URL}/api/${toApiEndpoint(table)}/${val}`,
                  {
                    method: "DELETE",
                  }
                );
              }
              return { error: null };
            } catch (e) {
              return { error: e };
            }
          };

          return createQueryPromise(executeDeleteMany, {});
        },
      }),
    }),

    channel: (name: string) => {
      const callbacks: { event: string; callback: (payload: any) => void }[] =
        [];
      let roomCode: string | null = null;
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
            socketClient.on("room-changed", (data: any) => {
              console.log("🔔 Socket received: room-changed", data);
              callbacks.forEach(({ callback }) =>
                callback({ eventType: "UPDATE", new: data })
              );
            });
            socketClient.on("player-joined", (data: any) => {
              console.log("🔔 Socket received: player-joined", {
                hasData: !!data,
                id: data?.id || "MISSING",
                name: data?.name || "MISSING",
                is_host: data?.is_host,
                avatar: data?.avatar,
                rawData: data,
                stringified: JSON.stringify(data),
              });
              callbacks.forEach(({ callback }) =>
                callback({ eventType: "INSERT", new: data })
              );
            });
            socketClient.on("player-left", (data: any) => {
              console.log("🔔 Socket received: player-left", data);
              callbacks.forEach(({ callback }) =>
                callback({ eventType: "DELETE", old: { id: data.playerId } })
              );
            });
            socketClient.on("player-changed", (data: any) => {
              console.log("🔔 Socket received: player-changed", data);
              callbacks.forEach(({ callback }) =>
                callback({ eventType: "UPDATE", new: data })
              );
            });
          }
          if (statusCallback)
            setTimeout(() => statusCallback("SUBSCRIBED"), 100);
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

    removeChannel: (channel: any) => {},

    functions: {
      invoke: async <T>(name: string, options: { body: any }) => {
        try {
          const res = await fetch(
            `${API_CONFIG.BASE_URL}/api/${name.replace("-", "/")}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(options.body),
            }
          );
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
