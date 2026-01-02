// Complete migration script - copies ALL data from old Supabase to new Supabase
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

async function migrateAll() {
  console.log(
    "🚀 Starting COMPLETE migration from old Supabase to new Supabase...\n"
  );

  // 1. Migrate rooms
  console.log("🏠 Migrating rooms...");
  const { data: rooms, error: roomsError } = await oldSupabase
    .from("rooms")
    .select("*");

  if (roomsError) {
    console.error("❌ Error fetching rooms:", roomsError.message);
  } else if (rooms && rooms.length > 0) {
    const { error: insertError } = await newSupabase
      .from("rooms")
      .upsert(rooms, { onConflict: "id" });

    if (insertError) {
      console.error("❌ Error inserting rooms:", insertError.message);
    } else {
      console.log(`✅ Migrated ${rooms.length} rooms`);
    }
  } else {
    console.log("ℹ️  No rooms to migrate");
  }

  // 2. Migrate players
  console.log("\n👥 Migrating players...");
  const { data: players, error: playersError } = await oldSupabase
    .from("players")
    .select("*");

  if (playersError) {
    console.error("❌ Error fetching players:", playersError.message);
  } else if (players && players.length > 0) {
    const { error: insertError } = await newSupabase
      .from("players")
      .upsert(players, { onConflict: "id" });

    if (insertError) {
      console.error("❌ Error inserting players:", insertError.message);
    } else {
      console.log(`✅ Migrated ${players.length} players`);
    }
  } else {
    console.log("ℹ️  No players to migrate");
  }

  // 3. Migrate paranoia_questions (skip if already migrated)
  console.log("\n📋 Checking paranoia_questions...");
  const { data: existingQuestions } = await newSupabase
    .from("paranoia_questions")
    .select("id")
    .limit(1);

  if (existingQuestions && existingQuestions.length > 0) {
    console.log("ℹ️  paranoia_questions already migrated, skipping...");
  } else {
    const { data: paranoiaQuestions, error: paranoiaError } = await oldSupabase
      .from("paranoia_questions")
      .select("*");

    if (paranoiaError) {
      console.error(
        "❌ Error fetching paranoia_questions:",
        paranoiaError.message
      );
    } else if (paranoiaQuestions && paranoiaQuestions.length > 0) {
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
        console.log(
          `✅ Migrated ${paranoiaQuestions.length} paranoia questions`
        );
      }
    } else {
      console.log("ℹ️  No paranoia_questions to migrate");
    }
  }

  // 4. Migrate game_covers (skip if already migrated)
  console.log("\n🎨 Checking game_covers...");
  const { data: existingCovers } = await newSupabase
    .from("game_covers")
    .select("id")
    .limit(1);

  if (existingCovers && existingCovers.length > 0) {
    console.log("ℹ️  game_covers already migrated, skipping...");
  } else {
    const { data: gameCovers, error: coversError } = await oldSupabase
      .from("game_covers")
      .select("*");

    if (coversError) {
      console.error("❌ Error fetching game_covers:", coversError.message);
    } else if (gameCovers && gameCovers.length > 0) {
      const coversToInsert = gameCovers
        .filter((c) => c.id && c.cover_url)
        .map((c) => ({
          id: c.id,
          title: c.title,
          cover_url: c.cover_url,
          emoji: c.emoji,
          gradient: c.gradient,
          created_at: c.created_at ?? new Date().toISOString(),
          updated_at: c.updated_at ?? new Date().toISOString(),
        }));

      if (coversToInsert.length > 0) {
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
  }

  // 5. Migrate five_sec_questions
  console.log("\n⏱️ Migrating five_sec_questions...");
  const { data: fiveSecQuestions, error: fiveSecError } = await oldSupabase
    .from("five_sec_questions")
    .select("*");

  if (fiveSecError) {
    console.error(
      "❌ Error fetching five_sec_questions:",
      fiveSecError.message
    );
  } else if (fiveSecQuestions && fiveSecQuestions.length > 0) {
    const { error: insertError } = await newSupabase
      .from("five_sec_questions")
      .upsert(fiveSecQuestions, { onConflict: "id" });

    if (insertError) {
      console.error(
        "❌ Error inserting five_sec_questions:",
        insertError.message
      );
    } else {
      console.log(`✅ Migrated ${fiveSecQuestions.length} five_sec_questions`);
    }
  } else {
    console.log("ℹ️  No five_sec_questions to migrate");
  }

  // 6. Migrate floating_names
  console.log("\n🎈 Migrating floating_names...");
  const { data: floatingNames, error: floatingError } = await oldSupabase
    .from("floating_names")
    .select("*");

  if (floatingError) {
    console.error("❌ Error fetching floating_names:", floatingError.message);
  } else if (floatingNames && floatingNames.length > 0) {
    const { error: insertError } = await newSupabase
      .from("floating_names")
      .upsert(floatingNames, { onConflict: "id" });

    if (insertError) {
      console.error("❌ Error inserting floating_names:", insertError.message);
    } else {
      console.log(`✅ Migrated ${floatingNames.length} floating_names`);
    }
  } else {
    console.log("ℹ️  No floating_names to migrate");
  }

  console.log("\n🎉 Complete migration finished!");
  console.log("\n📊 Summary of tables migrated:");
  console.log("   - rooms");
  console.log("   - players");
  console.log("   - paranoia_questions");
  console.log("   - game_covers");
  console.log("   - five_sec_questions");
  console.log("   - floating_names");
}

migrateAll().catch(console.error);
