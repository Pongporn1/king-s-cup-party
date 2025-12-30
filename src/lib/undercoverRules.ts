// Undercover Game Rules - สายลับจับแอ๊บ

export type PlayerRole = "CIVILIAN" | "UNDERCOVER" | "MR_WHITE";
export type GamePhase =
  | "WAITING"
  | "REVEAL_WORD"
  | "DESCRIBE"
  | "VOTING"
  | "VOTE_RESULT"
  | "FINISHED";

export interface UndercoverPlayer {
  id: string;
  name: string;
  avatar?: number;
  role: PlayerRole;
  word: string;
  is_alive: boolean;
  vote_count: number;
  has_voted: boolean;
  voted_for?: string; // player id ที่โหวตให้
  is_host: boolean;
}

export interface VocabularyPair {
  id: number;
  category: string;
  word_civilian: string;
  word_undercover: string;
}

// คลังคำศัพท์
export const VOCABULARY_PAIRS: VocabularyPair[] = [
  // หมวดของกิน
  {
    id: 1,
    category: "ของกิน",
    word_civilian: "ข้าวมันไก่",
    word_undercover: "ข้าวหมกไก่",
  },
  {
    id: 2,
    category: "ของกิน",
    word_civilian: "เป๊ปซี่",
    word_undercover: "โค้ก",
  },
  {
    id: 3,
    category: "ของกิน",
    word_civilian: "วิสกี้",
    word_undercover: "เหล้าขาว",
  },
  {
    id: 4,
    category: "ของกิน",
    word_civilian: "หมูกระทะ",
    word_undercover: "ชาบู",
  },
  {
    id: 5,
    category: "ของกิน",
    word_civilian: "ส้มตำ",
    word_undercover: "ตำซั่ว",
  },
  {
    id: 6,
    category: "ของกิน",
    word_civilian: "ก๋วยเตี๋ยว",
    word_undercover: "ผัดไทย",
  },
  {
    id: 7,
    category: "ของกิน",
    word_civilian: "ไข่ดาว",
    word_undercover: "ไข่เจียว",
  },
  { id: 8, category: "ของกิน", word_civilian: "กาแฟ", word_undercover: "ชา" },
  {
    id: 9,
    category: "ของกิน",
    word_civilian: "พิซซ่า",
    word_undercover: "แฮมเบอร์เกอร์",
  },
  {
    id: 10,
    category: "ของกิน",
    word_civilian: "ไอศกรีม",
    word_undercover: "โยเกิร์ต",
  },

  // หมวดสถานที่
  {
    id: 11,
    category: "สถานที่",
    word_civilian: "โรงพยาบาล",
    word_undercover: "โรงแรม",
  },
  {
    id: 12,
    category: "สถานที่",
    word_civilian: "ทะเล",
    word_undercover: "แม่น้ำ",
  },
  {
    id: 13,
    category: "สถานที่",
    word_civilian: "โรงเรียน",
    word_undercover: "มหาวิทยาลัย",
  },
  {
    id: 14,
    category: "สถานที่",
    word_civilian: "ห้างสรรพสินค้า",
    word_undercover: "ตลาดนัด",
  },
  {
    id: 15,
    category: "สถานที่",
    word_civilian: "สนามบิน",
    word_undercover: "สถานีรถไฟ",
  },
  {
    id: 16,
    category: "สถานที่",
    word_civilian: "วัด",
    word_undercover: "โบสถ์",
  },
  {
    id: 17,
    category: "สถานที่",
    word_civilian: "ผับ",
    word_undercover: "คาราโอเกะ",
  },
  {
    id: 18,
    category: "สถานที่",
    word_civilian: "ห้องน้ำ",
    word_undercover: "ห้องนอน",
  },

  // หมวดการ์ตูน/อนิเมะ
  {
    id: 19,
    category: "การ์ตูน",
    word_civilian: "โดราเอมอน",
    word_undercover: "โนบิตะ",
  },
  {
    id: 20,
    category: "การ์ตูน",
    word_civilian: "กันดั้ม",
    word_undercover: "ทรานส์ฟอร์เมอร์ส",
  },
  {
    id: 21,
    category: "การ์ตูน",
    word_civilian: "นารูโตะ",
    word_undercover: "วันพีช",
  },
  {
    id: 22,
    category: "การ์ตูน",
    word_civilian: "ปิกาจู",
    word_undercover: "อีวุย",
  },
  {
    id: 23,
    category: "การ์ตูน",
    word_civilian: "มิกกี้เมาส์",
    word_undercover: "ทอมแอนด์เจอร์รี่",
  },

  // หมวดดารา/คนดัง
  {
    id: 24,
    category: "คนดัง",
    word_civilian: "ลิซ่า",
    word_undercover: "เจนนี่",
  },
  {
    id: 25,
    category: "คนดัง",
    word_civilian: "ณเดชน์",
    word_undercover: "มาริโอ้",
  },
  {
    id: 26,
    category: "คนดัง",
    word_civilian: "ใบเฟิร์น",
    word_undercover: "ญาญ่า",
  },

  // หมวดกิจกรรม
  {
    id: 27,
    category: "กิจกรรม",
    word_civilian: "ว่ายน้ำ",
    word_undercover: "ดำน้ำ",
  },
  {
    id: 28,
    category: "กิจกรรม",
    word_civilian: "ร้องเพลง",
    word_undercover: "เต้น",
  },
  {
    id: 29,
    category: "กิจกรรม",
    word_civilian: "นอน",
    word_undercover: "ฝันกลางวัน",
  },
  {
    id: 30,
    category: "กิจกรรม",
    word_civilian: "เล่นเกม",
    word_undercover: "ดูหนัง",
  },

  // หมวดสัตว์
  { id: 31, category: "สัตว์", word_civilian: "แมว", word_undercover: "เสือ" },
  {
    id: 32,
    category: "สัตว์",
    word_civilian: "หมา",
    word_undercover: "หมาป่า",
  },
  {
    id: 33,
    category: "สัตว์",
    word_civilian: "ช้าง",
    word_undercover: "ฮิปโป",
  },
  {
    id: 34,
    category: "สัตว์",
    word_civilian: "นก",
    word_undercover: "ค้างคาว",
  },

  // หมวดของใช้
  {
    id: 35,
    category: "ของใช้",
    word_civilian: "โทรศัพท์",
    word_undercover: "แท็บเล็ต",
  },
  {
    id: 36,
    category: "ของใช้",
    word_civilian: "รองเท้า",
    word_undercover: "รองเท้าแตะ",
  },
  {
    id: 37,
    category: "ของใช้",
    word_civilian: "หมอน",
    word_undercover: "ที่นอน",
  },
  {
    id: 38,
    category: "ของใช้",
    word_civilian: "แว่นตา",
    word_undercover: "แว่นกันแดด",
  },

  // หมวด 18+ (สำหรับผู้ใหญ่)
  { id: 39, category: "18+", word_civilian: "จูบ", word_undercover: "กอด" },
  { id: 40, category: "18+", word_civilian: "เมา", word_undercover: "เมาค้าง" },
  { id: 41, category: "18+", word_civilian: "แฟน", word_undercover: "กิ๊ก" },
  { id: 42, category: "18+", word_civilian: "โสด", word_undercover: "หม้าย" },
];

// คำนวณจำนวนสายลับตามจำนวนผู้เล่น
export function calculateSpyCount(playerCount: number): number {
  if (playerCount <= 4) return 1;
  if (playerCount <= 6) return 1;
  if (playerCount <= 8) return 2;
  return 2;
}

// สุ่มคำศัพท์
export function getRandomVocabulary(category?: string): VocabularyPair {
  let vocabList = VOCABULARY_PAIRS;
  if (category && category !== "ทั้งหมด") {
    vocabList = VOCABULARY_PAIRS.filter((v) => v.category === category);
  }
  return vocabList[Math.floor(Math.random() * vocabList.length)];
}

// กำหนดบทบาทให้ผู้เล่น
export function assignRoles(
  players: { id: string; name: string; avatar?: number; is_host: boolean }[],
  vocabulary: VocabularyPair,
  includeMrWhite: boolean = false
): UndercoverPlayer[] {
  const spyCount = calculateSpyCount(players.length);
  const mrWhiteCount = includeMrWhite && players.length >= 5 ? 1 : 0;

  // สุ่ม index สำหรับ Undercover
  const spyIndices = new Set<number>();
  while (spyIndices.size < spyCount) {
    spyIndices.add(Math.floor(Math.random() * players.length));
  }

  // สุ่ม index สำหรับ Mr. White (ถ้ามี)
  const mrWhiteIndices = new Set<number>();
  if (mrWhiteCount > 0) {
    while (mrWhiteIndices.size < mrWhiteCount) {
      const idx = Math.floor(Math.random() * players.length);
      if (!spyIndices.has(idx)) {
        mrWhiteIndices.add(idx);
      }
    }
  }

  return players.map((player, index) => {
    let role: PlayerRole = "CIVILIAN";
    let word = vocabulary.word_civilian;

    if (spyIndices.has(index)) {
      role = "UNDERCOVER";
      word = vocabulary.word_undercover;
    } else if (mrWhiteIndices.has(index)) {
      role = "MR_WHITE";
      word = "???"; // Mr. White ไม่รู้คำ
    }

    return {
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      role,
      word,
      is_alive: true,
      vote_count: 0,
      has_voted: false,
      is_host: player.is_host,
    };
  });
}

// ตรวจสอบผลเกม
export function checkGameResult(players: UndercoverPlayer[]): {
  isGameOver: boolean;
  winner: "CIVILIAN" | "UNDERCOVER" | null;
  reason: string;
} {
  const alivePlayers = players.filter((p) => p.is_alive);
  const aliveSpies = alivePlayers.filter((p) => p.role === "UNDERCOVER");
  const aliveCivilians = alivePlayers.filter(
    (p) => p.role === "CIVILIAN" || p.role === "MR_WHITE"
  );

  // Undercover ชนะ: เหลือ Spy = จำนวน Civilian ที่เหลือ
  if (aliveSpies.length >= aliveCivilians.length) {
    return {
      isGameOver: true,
      winner: "UNDERCOVER",
      reason: "🕵️ สายลับชนะ! สายลับเหลือเท่ากับหรือมากกว่าพลเมืองดี",
    };
  }

  // Civilian ชนะ: ไม่เหลือ Spy
  if (aliveSpies.length === 0) {
    return {
      isGameOver: true,
      winner: "CIVILIAN",
      reason: "👥 พลเมืองดีชนะ! จับสายลับได้ทั้งหมดแล้ว",
    };
  }

  return {
    isGameOver: false,
    winner: null,
    reason: "",
  };
}

// หาผู้เล่นที่ถูกโหวตสูงสุด
export function getEliminatedPlayer(
  players: UndercoverPlayer[]
): UndercoverPlayer | null {
  const alivePlayers = players.filter((p) => p.is_alive);
  if (alivePlayers.length === 0) return null;

  // หาคะแนนโหวตสูงสุด
  const maxVotes = Math.max(...alivePlayers.map((p) => p.vote_count));
  if (maxVotes === 0) return null;

  // หาผู้เล่นที่มีคะแนนโหวตสูงสุด
  const topVoted = alivePlayers.filter((p) => p.vote_count === maxVotes);

  // ถ้ามีคนโหวตเท่ากัน สุ่มเลือก 1 คน
  return topVoted[Math.floor(Math.random() * topVoted.length)];
}

// Get categories
export function getCategories(): string[] {
  const categories = new Set(VOCABULARY_PAIRS.map((v) => v.category));
  return ["ทั้งหมด", ...Array.from(categories)];
}
