// Migration script to copy data from old Supabase to new Supabase
import { createClient } from "@supabase/supabase-js";

// Old Supabase credentials
const OLD_SUPABASE_URL = "https://tgvqlxyeoahcpplytvfu.supabase.co";
const OLD_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndnFseHllb2FoY3BwbHl0dmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDA0OTgsImV4cCI6MjA4MjQxNjQ5OH0.KVT7hbUPTyBfA3pqjuUOd7qN_l4LJPDFXPninndRfek";

// New Supabase credentials
const NEW_SUPABASE_URL = "https://wmnmjfmgyeunmybovkgs.supabase.co";
const NEW_SUPABASE_KEY = "sb_publishable_PtP0btrjyS2koQPhXaUx1Q_KEw1Hv9N";

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY);

async function migrateData() {
  console.log("🚀 Starting migration from old Supabase to new Supabase...\n");

  // 1. Migrate paranoia_questions
  console.log("📋 Migrating paranoia_questions...");
  const { data: paranoiaQuestions, error: paranoiaError } = await oldSupabase
    .from("paranoia_questions")
    .select("*");

  if (paranoiaError) {
    console.error(
      "❌ Error fetching paranoia_questions:",
      paranoiaError.message
    );
  } else if (paranoiaQuestions && paranoiaQuestions.length > 0) {
    // Insert into new database (without id to let it auto-generate)
    const questionsToInsert = paranoiaQuestions.map((q) => ({
      question: q.question,
      is_default: q.is_default ?? false,
      created_by: q.created_by ?? null,
      created_at: q.created_at ?? new Date().toISOString(),
    }));

    const { error: insertError } = await newSupabase
      .from("paranoia_questions")
      .insert(questionsToInsert);

    if (insertError) {
      console.error(
        "❌ Error inserting paranoia_questions:",
        insertError.message
      );
    } else {
      console.log(`✅ Migrated ${paranoiaQuestions.length} paranoia questions`);
    }
  } else {
    console.log("ℹ️  No paranoia_questions to migrate");
  }

  // 2. Migrate game_covers
  console.log("\n🎨 Migrating game_covers...");
  const { data: gameCovers, error: coversError } = await oldSupabase
    .from("game_covers")
    .select("*");

  console.log("Game covers from old DB:", gameCovers?.length, "items");

  if (coversError) {
    console.error("❌ Error fetching game_covers:", coversError.message);
  } else if (gameCovers && gameCovers.length > 0) {
    // Map old structure (id as game_type) to new structure
    const coversToInsert = gameCovers
      .filter((c) => c.id && c.cover_url)
      .map((c) => ({
        game_type: c.id, // old structure uses 'id' as game type identifier
        cover_url: c.cover_url,
        updated_at: c.updated_at ?? new Date().toISOString(),
      }));

    if (coversToInsert.length === 0) {
      console.log("ℹ️  No valid game_covers to migrate");
    } else {
      console.log(`Inserting ${coversToInsert.length} covers...`);
      const { error: insertError } = await newSupabase
        .from("game_covers")
        .insert(coversToInsert);

      if (insertError) {
        console.error("❌ Error inserting game_covers:", insertError.message);
      } else {
        console.log(`✅ Migrated ${coversToInsert.length} game covers`);
      }
    }
  } else {
    console.log("ℹ️  No game_covers to migrate");
  }

  console.log("\n🎉 Migration complete!");
}

migrateData().catch(console.error);
