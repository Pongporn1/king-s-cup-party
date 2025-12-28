// ไพ่ป๊อกเด้ง - Pok Deng Card Game Rules

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type CardValue =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface PokDengCard {
  suit: Suit;
  value: CardValue;
}

// คำนวณแต้มของไพ่ 1 ใบ
export function getCardPoints(card: PokDengCard): number {
  if (card.value === "A") return 1;
  if (["10", "J", "Q", "K"].includes(card.value)) return 0;
  return parseInt(card.value);
}

// คำนวณแต้มรวมของไพ่ (ใช้เลขหลักหน่วย)
export function calculateTotalPoints(cards: PokDengCard[]): number {
  const total = cards.reduce((sum, card) => sum + getCardPoints(card), 0);
  return total % 10;
}

// ตรวจสอบว่าเป็นป๊อกหรือไม่ (ไพ่ 2 ใบ รวมได้ 8 หรือ 9)
export function isPok(cards: PokDengCard[]): {
  isPok: boolean;
  pokValue: 8 | 9 | null;
} {
  if (cards.length !== 2) return { isPok: false, pokValue: null };
  const points = calculateTotalPoints(cards);
  if (points === 9) return { isPok: true, pokValue: 9 };
  if (points === 8) return { isPok: true, pokValue: 8 };
  return { isPok: false, pokValue: null };
}

// ตรวจสอบเด้ง (ไพ่ดอกเหมือนกัน หรือ ไพ่คู่)
export function getDengMultiplier(cards: PokDengCard[]): number {
  if (cards.length < 2) return 1;

  // ตรวจสอบไพ่คู่ (เลขเดียวกัน)
  const isPair = cards.length >= 2 && cards[0].value === cards[1].value;

  // ตรวจสอบดอกเหมือนกัน
  const sameSuit = cards.every((card) => card.suit === cards[0].suit);

  if (cards.length === 2) {
    if (isPair && sameSuit) return 2; // คู่ + ดอกเดียวกัน
    if (isPair) return 2; // คู่
    if (sameSuit) return 2; // ดอกเดียวกัน
    return 1;
  }

  if (cards.length === 3) {
    // ไพ่ตอง (เลขเดียวกัน 3 ใบ)
    if (
      cards[0].value === cards[1].value &&
      cards[1].value === cards[2].value
    ) {
      return 5;
    }

    // ไพ่สามเหลือง (J, Q, K)
    const isThreeYellow = cards.every((card) =>
      ["J", "Q", "K"].includes(card.value)
    );
    if (isThreeYellow) return 3;

    // ไพ่เรียง
    const sortedValues = cards
      .map((card) => {
        if (card.value === "A") return 1;
        if (card.value === "J") return 11;
        if (card.value === "Q") return 12;
        if (card.value === "K") return 13;
        return parseInt(card.value);
      })
      .sort((a, b) => a - b);

    const isStraight =
      sortedValues[1] === sortedValues[0] + 1 &&
      sortedValues[2] === sortedValues[1] + 1;
    if (isStraight) return 3;

    // ไพ่สี (ดอกเดียวกัน 3 ใบ)
    if (sameSuit) return 3;

    // เด้ง 3 ใบ
    if (
      isPair ||
      cards[1].value === cards[2].value ||
      cards[0].value === cards[2].value
    ) {
      return 2;
    }

    return 1;
  }

  return 1;
}

// ตรวจสอบไพ่พิเศษ
export type SpecialHand =
  | "pok9"
  | "pok8"
  | "tong"
  | "samLeung"
  | "straight"
  | "flush"
  | "pair"
  | "deng"
  | "normal";

export function getSpecialHand(cards: PokDengCard[]): {
  type: SpecialHand;
  name: string;
  multiplier: number;
} {
  if (cards.length === 2) {
    const pok = isPok(cards);
    if (pok.pokValue === 9)
      return { type: "pok9", name: "ป๊อก 9", multiplier: 2 };
    if (pok.pokValue === 8)
      return { type: "pok8", name: "ป๊อก 8", multiplier: 2 };

    const sameSuit = cards[0].suit === cards[1].suit;
    const isPair = cards[0].value === cards[1].value;

    if (isPair) return { type: "pair", name: "ไพ่คู่", multiplier: 2 };
    if (sameSuit) return { type: "deng", name: "สองเด้ง", multiplier: 2 };
  }

  if (cards.length === 3) {
    // ไพ่ตอง
    if (
      cards[0].value === cards[1].value &&
      cards[1].value === cards[2].value
    ) {
      return { type: "tong", name: "ไพ่ตอง", multiplier: 5 };
    }

    // ไพ่สามเหลือง
    const isThreeYellow = cards.every((card) =>
      ["J", "Q", "K"].includes(card.value)
    );
    if (isThreeYellow)
      return { type: "samLeung", name: "สามเหลือง", multiplier: 3 };

    // ไพ่เรียง
    const sortedValues = cards
      .map((card) => {
        if (card.value === "A") return 1;
        if (card.value === "J") return 11;
        if (card.value === "Q") return 12;
        if (card.value === "K") return 13;
        return parseInt(card.value);
      })
      .sort((a, b) => a - b);

    const isStraight =
      sortedValues[1] === sortedValues[0] + 1 &&
      sortedValues[2] === sortedValues[1] + 1;
    if (isStraight)
      return { type: "straight", name: "ไพ่เรียง", multiplier: 3 };

    // ไพ่สี (Flush)
    const sameSuit = cards.every((card) => card.suit === cards[0].suit);
    if (sameSuit) return { type: "flush", name: "ไพ่สี", multiplier: 3 };

    // เด้ง 3 ใบ (มีคู่)
    if (
      cards[0].value === cards[1].value ||
      cards[1].value === cards[2].value ||
      cards[0].value === cards[2].value
    ) {
      return { type: "deng", name: "สามเด้ง", multiplier: 3 };
    }
  }

  return { type: "normal", name: "ธรรมดา", multiplier: 1 };
}

// เปรียบเทียบผลแพ้ชนะ
export type GameResult = "player_win" | "dealer_win" | "tie";

export function compareHands(
  playerCards: PokDengCard[],
  dealerCards: PokDengCard[]
): { result: GameResult; playerMultiplier: number; dealerMultiplier: number } {
  const playerPok = isPok(playerCards);
  const dealerPok = isPok(dealerCards);

  const playerPoints = calculateTotalPoints(playerCards);
  const dealerPoints = calculateTotalPoints(dealerCards);

  const playerSpecial = getSpecialHand(playerCards);
  const dealerSpecial = getSpecialHand(dealerCards);

  // ถ้าทั้งคู่มีป๊อก
  if (playerPok.isPok && dealerPok.isPok) {
    if (playerPok.pokValue! > dealerPok.pokValue!) {
      return {
        result: "player_win",
        playerMultiplier: playerSpecial.multiplier,
        dealerMultiplier: 1,
      };
    }
    if (playerPok.pokValue! < dealerPok.pokValue!) {
      return {
        result: "dealer_win",
        playerMultiplier: 1,
        dealerMultiplier: dealerSpecial.multiplier,
      };
    }
    // ป๊อกเท่ากัน = เจ้ามือชนะ
    return { result: "dealer_win", playerMultiplier: 1, dealerMultiplier: 1 };
  }

  // ผู้เล่นมีป๊อก แต่เจ้ามือไม่มี
  if (playerPok.isPok && !dealerPok.isPok) {
    return {
      result: "player_win",
      playerMultiplier: playerSpecial.multiplier,
      dealerMultiplier: 1,
    };
  }

  // เจ้ามือมีป๊อก แต่ผู้เล่นไม่มี
  if (!playerPok.isPok && dealerPok.isPok) {
    return {
      result: "dealer_win",
      playerMultiplier: 1,
      dealerMultiplier: dealerSpecial.multiplier,
    };
  }

  // ไม่มีใครป๊อก - เทียบแต้ม
  if (playerPoints > dealerPoints) {
    return {
      result: "player_win",
      playerMultiplier: playerSpecial.multiplier,
      dealerMultiplier: 1,
    };
  }
  if (playerPoints < dealerPoints) {
    return {
      result: "dealer_win",
      playerMultiplier: 1,
      dealerMultiplier: dealerSpecial.multiplier,
    };
  }

  // แต้มเท่ากัน = เจ้ามือชนะ
  return { result: "dealer_win", playerMultiplier: 1, dealerMultiplier: 1 };
}

// สร้างสำรับไพ่ 52 ใบ
export function createDeck(): PokDengCard[] {
  const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
  const values: CardValue[] = [
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

  const deck: PokDengCard[] = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }

  return shuffleDeck(deck);
}

// สับไพ่
export function shuffleDeck(deck: PokDengCard[]): PokDengCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// แปลงดอกไพ่เป็น emoji
export function getSuitEmoji(suit: Suit): string {
  switch (suit) {
    case "hearts":
      return "♥️";
    case "diamonds":
      return "♦️";
    case "clubs":
      return "♣️";
    case "spades":
      return "♠️";
  }
}

// แปลงสีของดอกไพ่
export function getSuitColor(suit: Suit): string {
  return suit === "hearts" || suit === "diamonds"
    ? "text-red-500"
    : "text-black";
}
