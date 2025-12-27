export interface CardRule {
  value: string;
  title: string;
  description: string;
  emoji: string;
}

export const CARD_RULES: Record<string, CardRule> = {
  'A': {
    value: 'A',
    title: 'ดื่ม 1 อึก',
    description: 'จัดไปเบาๆ 1 จิบ',
    emoji: '🍺'
  },
  '2': {
    value: '2',
    title: 'ดื่ม 2 อึก',
    description: 'เข้มขึ้นมาหน่อย 2 อึก',
    emoji: '🍻'
  },
  '3': {
    value: '3',
    title: 'ดื่ม 3 อึก',
    description: '3 อึกเน้นๆ',
    emoji: '🥃'
  },
  '4': {
    value: '4',
    title: 'ดื่ม 4 อึก',
    description: '4 อึก เต็มคำ',
    emoji: '🍾'
  },
  '5': {
    value: '5',
    title: 'จับบัดดี้ (Buddy)',
    description: 'เลือกเพื่อน 1 คน ถ้าเราดื่ม เพื่อนต้องดื่มด้วยตลอดเกม',
    emoji: '🤝'
  },
  '6': {
    value: '6',
    title: 'เกมหมวดหมู่',
    description: 'คนจับไพ่เลือกหมวด (เช่น สัตว์, ยี่ห้อรถ) ไล่ตอบทีละคน ห้ามซ้ำ/ห้ามช้า',
    emoji: '📝'
  },
  '7': {
    value: '7',
    title: 'เกมเลข 7',
    description: 'นับเลขวนไป ห้ามพูดเลขที่มี 7 หรือหาร 7 ลงตัว ให้ตบมือแทน',
    emoji: '👏'
  },
  '8': {
    value: '8',
    title: 'บัตรผ่านห้องน้ำ',
    description: 'เก็บไว้ใช้เข้าห้องน้ำ หรือขายต่อเพื่อนได้',
    emoji: '🚽'
  },
  '9': {
    value: '9',
    title: 'ซ้ายดื่ม',
    description: 'คนทางซ้ายมือของคุณ ดื่ม 1 อึก',
    emoji: '👈'
  },
  '10': {
    value: '10',
    title: 'ขวาดื่ม',
    description: 'คนทางขวามือของคุณ ดื่ม 1 อึก',
    emoji: '👉'
  },
  'J': {
    value: 'J',
    title: 'เกมจับคาง',
    description: 'คนจับทำท่าอะไรก็ได้ คนตามช้าสุดดื่ม',
    emoji: '🤏'
  },
  'Q': {
    value: 'Q',
    title: 'ห้ามพูดด้วย',
    description: 'ห้ามใครคุยกับคนจับไพ่ ใครเผลอคุยโดนดื่ม',
    emoji: '🤫'
  },
  'K': {
    value: 'K',
    title: 'King สั่ง!',
    description: 'ใบ 1-3 สั่งทำอะไรก็ได้, ใบที่ 4 (สุดท้าย) ดื่มหมดแก้ว!',
    emoji: '👑'
  }
};

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface PlayingCard {
  value: CardValue;
  suit: Suit;
  id: string;
}

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const VALUES: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-foreground',
  spades: 'text-foreground'
};

export function createDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({
        value,
        suit,
        id: `${value}-${suit}`
      });
    }
  }
  return deck;
}

export function shuffleDeck(deck: PlayingCard[]): PlayingCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
