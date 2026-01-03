declare const Deno: {
  env: { get(key: string): string | undefined };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

// @ts-expect-error - Supabase Edge Functions resolve HTTPS imports at runtime (Deno)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ROOM_MAX_AGE_MS = 3 * 60 * 60 * 1000; // 3 hours
const TEST_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

type CleanupRequest = {
  testMode?: boolean;
  maxAgeMs?: number;
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    let body: CleanupRequest = {};
    if (req.method !== "GET") {
      try {
        body = (await req.json()) as CleanupRequest;
      } catch {
        body = {};
      }
    }

    const isTestMode = body.testMode === true;

    // Security: only allow client-supplied maxAgeMs in TEST mode.
    // In production, we always use ROOM_MAX_AGE_MS to prevent abuse.
    const requestedMaxAgeMs =
      isTestMode &&
      typeof body.maxAgeMs === "number" &&
      Number.isFinite(body.maxAgeMs)
        ? Math.max(60_000, Math.min(body.maxAgeMs, 24 * 60 * 60 * 1000))
        : undefined;

    const maxAgeMs = isTestMode
      ? requestedMaxAgeMs ?? TEST_MAX_AGE_MS
      : ROOM_MAX_AGE_MS;

    const cutoffTime = new Date(Date.now() - maxAgeMs).toISOString();

    const { data, error } = await supabase
      .from("rooms")
      .delete()
      .lt("created_at", cutoffTime)
      .select("id, code, created_at");

    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        deletedCount: data?.length ?? 0,
        cutoffTime,
        deletedCodes: (data ?? []).map((r: { code: string }) => r.code),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
