import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PokDengCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  numericValue: number;
}

interface AIRequest {
  type: 'strategy' | 'explain' | 'calculate';
  cards?: PokDengCard[];
  dealerCards?: PokDengCard[];
  message?: string;
}

// คำนวณแต้มไพ่
function calculatePoints(cards: PokDengCard[]): number {
  const total = cards.reduce((sum, card) => sum + card.numericValue, 0);
  return total % 10;
}

// ตรวจสอบป๊อก
function checkPok(cards: PokDengCard[]): { isPok: boolean; type: string } {
  if (cards.length !== 2) return { isPok: false, type: '' };
  const points = calculatePoints(cards);
  if (points === 9) return { isPok: true, type: 'ป๊อก 9' };
  if (points === 8) return { isPok: true, type: 'ป๊อก 8' };
  return { isPok: false, type: '' };
}

// ตรวจสอบมือพิเศษ
function checkSpecialHand(cards: PokDengCard[]): string | null {
  if (cards.length === 3) {
    const values = cards.map(c => c.numericValue);
    const suits = cards.map(c => c.suit);
    
    // ตอง (เลขเหมือนกัน 3 ใบ)
    if (values[0] === values[1] && values[1] === values[2]) {
      return 'ตอง';
    }
    
    // เรียง (ไพ่เรียงกัน)
    const sorted = [...values].sort((a, b) => a - b);
    if (sorted[2] - sorted[1] === 1 && sorted[1] - sorted[0] === 1) {
      return 'เรียง';
    }
    
    // สามหน้า (J, Q, K 3 ใบ)
    if (values.every(v => v === 0 && cards.every(c => ['J', 'Q', 'K'].includes(c.value)))) {
      return 'สามหน้า';
    }
    
    // สามโบ๊ก (สีเดียวกัน 3 ใบ)
    if (suits[0] === suits[1] && suits[1] === suits[2]) {
      return 'สามโบ๊ก';
    }
  }
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { type, cards, dealerCards, message }: AIRequest = await req.json();
    console.log('AI Request:', { type, cards, dealerCards, message });

    let systemPrompt = `คุณเป็นผู้เชี่ยวชาญเกมป๊อกเด้ง (Thai Poker) ให้คำแนะนำเป็นภาษาไทย กระชับและชัดเจน

กติกาป๊อกเด้ง:
- ไพ่ A = 1 แต้ม, 2-9 = ตามหน้า, 10/J/Q/K = 0 แต้ม
- รวมแต้มแล้ว mod 10 (เหลือเฉพาะหลักหน่วย)
- ป๊อก 8 หรือ 9 = ชนะทันที (ถ้าเจ้ามือไม่ป๊อกเท่าหรือสูงกว่า)
- หลังแจกไพ่ 2 ใบ ผู้เล่นเลือกจั่วหรือหยุด
- มือพิเศษ: ตอง (x5), สามหน้า (x5), เรียง (x3), สามโบ๊ก (x3)`;

    let userPrompt = '';

    if (type === 'strategy' && cards) {
      const points = calculatePoints(cards);
      const pokCheck = checkPok(cards);
      const specialHand = cards.length === 3 ? checkSpecialHand(cards) : null;
      
      const cardNames = cards.map(c => `${c.value}${c.suit === 'hearts' ? '♥' : c.suit === 'diamonds' ? '♦' : c.suit === 'clubs' ? '♣' : '♠'}`).join(', ');
      
      userPrompt = `ไพ่ในมือ: ${cardNames}
แต้มรวม: ${points}
${pokCheck.isPok ? `มี${pokCheck.type}!` : ''}
${specialHand ? `มือพิเศษ: ${specialHand}` : ''}
${dealerCards ? `ไพ่เจ้ามือ: ${dealerCards.map(c => `${c.value}${c.suit === 'hearts' ? '♥' : c.suit === 'diamonds' ? '♦' : c.suit === 'clubs' ? '♣' : '♠'}`).join(', ')}` : ''}

แนะนำว่าควร${cards.length === 2 ? 'จั่วหรือหยุด' : 'เล่นยังไงต่อ'}?`;
    } else if (type === 'calculate' && cards) {
      const points = calculatePoints(cards);
      const pokCheck = checkPok(cards);
      const specialHand = cards.length === 3 ? checkSpecialHand(cards) : null;
      
      userPrompt = `คำนวณแต้มและวิเคราะห์ไพ่:
ไพ่: ${cards.map(c => `${c.value}${c.suit === 'hearts' ? '♥' : c.suit === 'diamonds' ? '♦' : c.suit === 'clubs' ? '♣' : '♠'}`).join(', ')}
แต้มรวม: ${points}
${pokCheck.isPok ? pokCheck.type : 'ไม่มีป๊อก'}
${specialHand ? `มือพิเศษ: ${specialHand}` : ''}

อธิบายการคำนวณและโอกาสชนะ`;
    } else if (type === 'explain') {
      userPrompt = message || 'อธิบายกติกาเกมป๊อกเด้งแบบสั้นๆ';
    } else {
      userPrompt = message || 'ให้คำแนะนำเกมป๊อกเด้ง';
    }

    console.log('Calling Lovable AI with prompt:', userPrompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          advice: 'ระบบ AI ถูกใช้งานมากเกินไป กรุณารอสักครู่'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content || 'ไม่สามารถให้คำแนะนำได้';
    
    console.log('AI Response:', advice);

    // คำนวณข้อมูลเพิ่มเติม
    let calculation = null;
    if (cards) {
      calculation = {
        points: calculatePoints(cards),
        pok: checkPok(cards),
        specialHand: cards.length === 3 ? checkSpecialHand(cards) : null,
      };
    }

    return new Response(JSON.stringify({ 
      advice,
      calculation,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pokdeng-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      advice: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
