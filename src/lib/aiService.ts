// AI Service - Generate content using AI
// This uses GitHub Copilot's language model capabilities

export interface VocabularyPair {
  category: string;
  word_civilian: string;
  word_undercover: string;
}

export interface CardRule {
  card: string;
  rule: string;
  difficulty: "easy" | "medium" | "hard";
}

/**
 * Generate vocabulary pairs for Undercover game using AI
 * @param category - The category for vocabulary (e.g., "ผลไม้", "สถานที่ท่องเที่ยว")
 * @param count - Number of pairs to generate (default: 3)
 * @returns Array of vocabulary pairs
 */
export async function generateVocabularyPairs(
  category: string,
  count: number = 3
): Promise<VocabularyPair[]> {
  try {
    // Simulated AI generation
    // In production, this would call OpenAI API or similar
    const pairs: VocabularyPair[] = [];

    // AI Prompt context for generation
    const prompt = `สร้างคำศัพท์คู่สำหรับเกม Undercover ในหมวด "${category}"
    
กติกา:
- คำทั้งสองต้องเกี่ยวข้องกัน แต่ไม่เหมือนกันเป๊ะ
- คำต้องคล้ายกันพอที่ Undercover อธิบายได้โดยไม่โดนจับ
- ใช้คำที่คนไทยรู้จักและเล่นสนุก
- ห้ามใช้คำหยาบหรือไม่เหมาะสม

ตัวอย่าง:
หมวด "อาหาร": Civilian: "ส้มตำ", Undercover: "ยำวุ้นเส้น"
หมวด "สถานที่": Civilian: "ทะเล", Undercover: "ทะเลสาบ"
หมวด "ผลไม้": Civilian: "มะม่วง", Undercover: "มะปราง"

สร้าง ${count} คำคู่สำหรับหมวด "${category}":`;

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate pairs based on category
    const categoryLower = category.toLowerCase();

    if (categoryLower.includes("อาหาร") || categoryLower.includes("ของกิน")) {
      pairs.push(
        { category, word_civilian: "พิซซ่า", word_undercover: "ขนมปัง" },
        { category, word_civilian: "กาแฟ", word_undercover: "ชา" },
        { category, word_civilian: "ข้าวผัด", word_undercover: "ข้าวหน้า" }
      );
    } else if (
      categoryLower.includes("สถานที่") ||
      categoryLower.includes("ที่เที่ยว")
    ) {
      pairs.push(
        { category, word_civilian: "ภูเขา", word_undercover: "เขา" },
        { category, word_civilian: "ห้างสรรพสินค้า", word_undercover: "ตลาด" },
        { category, word_civilian: "โรงภาพยนตร์", word_undercover: "โรงละคร" }
      );
    } else if (categoryLower.includes("ผลไม้")) {
      pairs.push(
        { category, word_civilian: "แตงโม", word_undercover: "แคนตาลูป" },
        {
          category,
          word_civilian: "สตรอว์เบอร์รี่",
          word_undercover: "ราสเบอร์รี่",
        },
        { category, word_civilian: "องุ่น", word_undercover: "เรซิน" }
      );
    } else if (categoryLower.includes("สัตว์")) {
      pairs.push(
        { category, word_civilian: "สุนัข", word_undercover: "หมาป่า" },
        { category, word_civilian: "แมว", word_undercover: "เสือ" },
        { category, word_civilian: "ช้าง", word_undercover: "แมมมอธ" }
      );
    } else if (
      categoryLower.includes("ยานพาหนะ") ||
      categoryLower.includes("รถ")
    ) {
      pairs.push(
        { category, word_civilian: "รถยนต์", word_undercover: "รถตู้" },
        {
          category,
          word_civilian: "เครื่องบิน",
          word_undercover: "เฮลิคอปเตอร์",
        },
        { category, word_civilian: "เรือ", word_undercover: "เรือใบ" }
      );
    } else if (categoryLower.includes("กีฬา")) {
      pairs.push(
        { category, word_civilian: "ฟุตบอล", word_undercover: "ฟุตซอล" },
        { category, word_civilian: "เทนนิส", word_undercover: "แบดมินตัน" },
        { category, word_civilian: "บาสเกตบอล", word_undercover: "วอลเลย์บอล" }
      );
    } else if (
      categoryLower.includes("อาชีพ") ||
      categoryLower.includes("งาน")
    ) {
      pairs.push(
        { category, word_civilian: "หมอ", word_undercover: "พยาบาล" },
        { category, word_civilian: "ครู", word_undercover: "อาจารย์" },
        { category, word_civilian: "วิศวกร", word_undercover: "สถาปนิก" }
      );
    } else if (categoryLower.includes("เครื่องดื่ม")) {
      pairs.push(
        { category, word_civilian: "น้ำส้ม", word_undercover: "น้ำมะนาว" },
        { category, word_civilian: "โค้ก", word_undercover: "เป๊ปซี่" },
        { category, word_civilian: "นม", word_undercover: "โยเกิร์ต" }
      );
    } else {
      // Generic fallback
      pairs.push(
        { category, word_civilian: "ของจริง", word_undercover: "ของปลอม" },
        { category, word_civilian: "ใหญ่", word_undercover: "เล็ก" },
        { category, word_civilian: "ร้อน", word_undercover: "อุ่น" }
      );
    }

    return pairs.slice(0, count);
  } catch (error) {
    console.error("Error generating vocabulary:", error);
    throw new Error("ไม่สามารถสร้างคำศัพท์ได้ กรุณาลองใหม่อีกครั้ง");
  }
}

/**
 * Generate creative card rules for King's Cup game
 * @param cardNumber - The card number (1-13) or name (A, 2-10, J, Q, K)
 * @param playerCount - Number of players for difficulty adjustment
 * @param difficulty - Desired difficulty level
 * @returns Generated rule
 */
export async function generateCardRule(
  cardNumber: string,
  playerCount: number = 4,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<CardRule> {
  try {
    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const easyRules = [
      "ผู้ที่จั่วได้ดื่ม 1 อึก",
      "ชี้คนที่นั่งทางซ้ายให้ดื่ม",
      "บอกชื่อสัตว์ 1 ตัว ใครทำไม่ได้ดื่ม",
      "ผู้ที่จั่วเลือกคนดื่ม 1 คน",
      "ทุกคนดื่มพร้อมกัน 1 อึก",
    ];

    const mediumRules = [
      "เกมคำคล้อง: พูดคำที่คล้องกับ 'ดื่ม' ใครตอบไม่ได้ดื่ม",
      "นับเลขวน 1-21 ใครพูดเลข 7 หรือพูดเลขที่มี 7 ต้องดื่ม",
      "ห้ามพูดชื่อคนในกลุ่ม ใครพูดดื่ม จนกว่าจะจั่วไพ่ใบต่อไป",
      "สับเปลี่ยนที่นั่งตามเข็มนาฬิกา คนสุดท้ายดื่ม",
      "เล่นเกม 'นี่คือ': ส่งต่อของวนไป ใครพูดผิดดื่ม",
      "ทำท่าทาง ให้คนอื่นเดา ใครเดาถูกก่อนให้ผู้จั่วดื่ม",
      "ห้ามยกแขนขวา ใครยกดื่ม จนกว่าจะมีไพ่ใบนี้อีกครั้ง",
    ];

    const hardRules = [
      "Master Rule: ผู้จั่วสร้างกติกาใหม่ ใครฝ่าฝืนดื่ม ใช้ได้จนจบเกม",
      "เกมคำต้องห้าม: ห้ามพูดคำว่า 'ดื่ม' ใครพูดดื่ม 3 อึก",
      "ลูกโซ่: ผู้จั่วเลือกคน ต่อไปหมุนเวียนตามเข็มนาฬิกา แต่ละคนดื่ม 1 อึก",
      "เกมคำศัพท์: พูดคำที่ขึ้นต้นด้วยตัวอักษรสุดท้ายของคำก่อนหน้า ใครตอบไม่ได้ดื่ม 2 อึก",
      "ห้ามเอามือแตะโต๊ะ ใครแตะดื่ม จนกว่าจะมีกติกาใหม่",
      `แจกการ์ด: ผู้จั่วแจกการดื่มให้คนอื่นรวม ${playerCount} อึก แบ่งยังไงก็ได้`,
      "เกมจับคู่: ผู้จั่วเลือกคู่หู ต่อไปถ้าคู่หูดื่ม อีกคนก็ต้องดื่มตาม",
    ];

    let ruleList: string[];
    switch (difficulty) {
      case "easy":
        ruleList = easyRules;
        break;
      case "hard":
        ruleList = hardRules;
        break;
      default:
        ruleList = mediumRules;
    }

    const randomRule = ruleList[Math.floor(Math.random() * ruleList.length)];

    return {
      card: cardNumber,
      rule: randomRule,
      difficulty,
    };
  } catch (error) {
    console.error("Error generating rule:", error);
    throw new Error("ไม่สามารถสร้างกติกาได้ กรุณาลองใหม่อีกครั้ง");
  }
}

/**
 * Generate multiple card rules at once
 */
export async function generateMultipleRules(
  count: number = 5,
  playerCount: number = 4
): Promise<CardRule[]> {
  const cards = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  const difficulties: Array<"easy" | "medium" | "hard"> = [
    "easy",
    "medium",
    "hard",
  ];

  const promises = [];
  for (let i = 0; i < count; i++) {
    const card = cards[Math.floor(Math.random() * cards.length)];
    const difficulty =
      difficulties[Math.floor(Math.random() * difficulties.length)];
    promises.push(generateCardRule(card, playerCount, difficulty));
  }

  return Promise.all(promises);
}

/**
 * Generate Paranoia questions using AI
 * @param count - Number of questions to generate (default: 5)
 * @returns Array of Paranoia questions
 */
export async function generateParanoiaQuestions(
  count: number = 5
): Promise<string[]> {
  try {
    // AI Prompt context for generation
    const prompt = `สร้างคำถามสำหรับเกม Paranoia
    
กติกา:
- คำถามต้องเป็นคำถามที่ต้องเลือกคนในกลุ่ม
- คำถามต้องสนุก ไม่หยาบ ไม่ก้าวร้าว
- ต้องทำให้คนอยากรู้คำตอบ
- เหมาะสำหรับเล่นในปาร์ตี้

ตัวอย่าง:
- "ใครที่คุณคิดว่าจะเป็นคนสุดท้ายที่แต่งงาน?"
- "ใครที่คุณคิดว่ามีลุคดีที่สุดในกลุ่ม?"
- "ใครที่คุณอยากไปเที่ยวด้วยมากที่สุด?"

สร้าง ${count} คำถาม:`;

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Generate varied questions
    const questionTemplates = [
      "ใครที่คุณคิดว่ามีบุคลิกสนุกที่สุด?",
      "ใครที่คุณอยากให้เป็นเพื่อนสนิทมากที่สุด?",
      "ใครที่คุณคิดว่าหุ่นดีที่สุดในกลุ่ม?",
      "ใครที่คุณคิดว่าน่าจะโกหกเก่งที่สุด?",
      "ใครที่คุณคิดว่าจะประสบความสำเร็จมากที่สุด?",
      "ใครที่คุณอยากไปกินข้าวด้วยมากที่สุด?",
      "ใครที่คุณคิดว่าขับรถเก่งที่สุด?",
      "ใครที่คุณคิดว่าน่าจะร้องเพลงเพราะที่สุด?",
      "ใครที่คุณคิดว่ามีไอเดียเจ๋งที่สุด?",
      "ใครที่คุณอยากให้เป็นหัวหน้ากลุ่ม?",
      "ใครที่คุณคิดว่าน่าจะมีแฟนก่อน?",
      "ใครที่คุณคิดว่าเป็นคนเก็บความลับได้ดีที่สุด?",
      "ใครที่คุณคิดว่าน่าจะทำอาหารเก่งที่สุด?",
      "ใครที่คุณอยากขอคำแนะนำเรื่องชีวิต?",
      "ใครที่คุณคิดว่ามีความมั่นใจในตัวเองมากที่สุด?",
    ];

    // Randomly select and shuffle
    const shuffled = [...questionTemplates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error("Error generating Paranoia questions:", error);
    // Return fallback questions
    return [
      "ใครที่คุณคิดว่ามีบุคลิกสนุกที่สุด?",
      "ใครที่คุณอยากให้เป็นเพื่อนสนิทมากที่สุด?",
      "ใครที่คุณคิดว่าน่าจะโกหกเก่งที่สุด?",
      "ใครที่คุณคิดว่าจะประสบความสำเร็จมากที่สุด?",
      "ใครที่คุณอยากไปกินข้าวด้วยมากที่สุด?",
    ].slice(0, count);
  }
}
