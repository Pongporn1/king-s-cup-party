# 🎨 Animations & Effects + 🌈 Themes & Customization

## ✨ Features Added

### 1. 🎉 Confetti Animation System

**File:** `src/components/Confetti.tsx`

- Celebration particle animation for game victories
- 50 animated particles with physics simulation
- 8 vibrant colors (gold, pink, turquoise, tomato, purple, lime, deep pink, sky blue)
- Smooth 60fps animation using `requestAnimationFrame`
- Gravity physics with random velocities and rotation
- Auto-cleanup after duration expires (default 3000ms)
- Configurable duration and completion callback

**Integration:**

- ✅ King's Cup (GameRoom): Triggers when game is over (`cards_remaining === 0`)
- ✅ Undercover (UndercoverGameRoom): Triggers when game phase is "FINISHED"
- Duration: 6 seconds for King's Cup, 5 seconds for Undercover

---

### 2. 🎨 Complete Theme System

**File:** `src/lib/themeSystem.ts`

8 Beautiful Themes:

1. **Classic (คลาสสิก)** - Purple gradient with party background
2. **Neon (นีออน)** - Bright neon green/cyan/magenta
3. **Sunset (พระอาทิตย์ตก)** - Warm red/orange/yellow gradient
4. **Ocean (มหาสมุทร)** - Cool blue gradient
5. **Forest (ป่าไม้)** - Green nature tones
6. **Royal (ราชวงศ์)** - Purple and gold luxury
7. **Dark (มืดสนิท)** - Dark gray minimalist
8. **Candy (ลูกอม)** - Pastel pink/yellow/blue

**Features:**

- CSS custom properties for dynamic theming
- LocalStorage persistence
- Smooth transitions between themes (1000ms)
- Custom event system for theme changes
- Per-theme color schemes (primary, secondary, accent, background, text)
- Gradient backgrounds with optional images

---

### 3. 🎨 Theme Switcher Component

**File:** `src/components/ThemeSwitcher.tsx`

- Floating button (top-right, below language switcher)
- Beautiful dialog with visual theme previews
- Shows 3 color swatches per theme
- Hover effects with scale animation
- Checkmark on selected theme
- Fully translated (Thai/English)
- Smooth animations and transitions

---

### 4. 🌊 Animated Themed Background

**File:** `src/components/ThemedBackground.tsx`

- Responds to theme changes in real-time
- Smooth 1000ms transitions
- Three animated floating gradient orbs
- Different animation delays and durations (8s, 10s, 12s)
- Blur effects for ambient lighting
- Optional background image support
- Dark overlay for text readability

---

### 5. 💫 Enhanced Card Flip Animations

**Updated:** `src/index.css`

**Card Animations:**

- Smooth 800ms flip with cubic-bezier easing
- 3D perspective (1000px)
- Drop shadow glow when flipped (purple)
- Hover scale effect (1.05x)
- Maintains 3D transform when scaled

**New Animations:**

- `fadeIn` - Fade and slide up (0.5s)
- `slideIn` - Slide from left with fade (0.4s)
- `scaleIn` - Scale up with fade (0.3s)
- `bounce` - Soft bounce animation (2s loop)
- Button press effect (scale 0.95)

---

### 6. 🎯 Smooth Transitions System

**Updated:** `src/index.css`

**Global Utilities:**

- `.transition-smooth` - All properties, 300ms cubic-bezier
- `.animate-fade-in` - Page entry animation
- `.animate-slide-in` - Slide-in for lists
- `.animate-scale-in` - Scale entrance
- `.animate-bounce-soft` - Gentle bounce loop
- `.btn-press` - Active button press

**Theme Utilities:**

- `.theme-bg` - Theme background color
- `.theme-card-bg` - Theme card background
- `.theme-text` - Theme text color
- `.theme-text-secondary` - Theme secondary text
- `.theme-primary` - Theme primary color
- `.theme-gradient` - Theme gradient

---

### 7. 🎮 UI Component Enhancements

**Updated Buttons:** `src/components/ui/button.tsx`

- Added `active:scale-[0.98]` to all variants
- Smooth 200ms transitions
- Hover scale effects

**Index Page Animations:** `src/pages/Index.tsx`

- `animate-fade-in` on main container
- `animate-scale-in` on card
- `hover:scale-105` on all game buttons
- 300ms transition duration

---

## 🚀 Usage

### Initialize Theme

Theme is automatically initialized in `src/main.tsx` before React renders.

### Change Theme

Click the palette icon button (🎨) in the top-right corner to open the theme selector.

### Confetti Triggers

Confetti automatically appears when:

- King's Cup game ends (all cards drawn)
- Undercover game finishes (FINISHED phase)
- Pok Deng winners (if integrated)

### Custom Confetti

```tsx
import Confetti from "@/components/Confetti";

<Confetti
  active={shouldShow}
  duration={5000}
  onComplete={() => console.log("Confetti finished!")}
/>;
```

### Apply Theme Colors

```tsx
// In TSX
<div style={{ backgroundColor: 'var(--color-primary)' }} />

// In CSS
.my-element {
  background: var(--color-background);
  color: var(--color-text);
}
```

---

## 📊 Performance

- **Confetti:** Uses `requestAnimationFrame` for 60fps
- **Themes:** Smooth 1s transitions with GPU acceleration
- **Animations:** Hardware-accelerated transforms
- **Background:** Minimal repaints, uses blur filters
- **Memory:** Auto-cleanup on unmount

---

## 🌐 Internationalization

All theme-related UI is fully translated:

**Thai:**

- เปลี่ยนธีม (Change Theme)
- เลือกธีม (Select Theme)
- Theme names in Thai

**English:**

- Change Theme
- Select Theme
- Theme names in English

---

## 🎯 Future Enhancements (Not Yet Implemented)

1. **Card Design Themes** - Different visual styles for playing cards
2. **Sound Effects** - Audio feedback for interactions
3. **Custom Backgrounds** - User-uploaded images
4. **Animation Settings** - Toggle/adjust animation speeds
5. **Particle Effects** - More celebration animations
6. **Theme Editor** - Create custom color schemes
7. **Dark/Light Mode** - System preference detection

---

## 📝 Files Modified

### New Files Created:

1. `src/lib/themeSystem.ts` - Theme management
2. `src/components/ThemeSwitcher.tsx` - Theme selector UI
3. `src/components/ThemedBackground.tsx` - Animated background
4. `src/components/Confetti.tsx` - Celebration animation

### Files Modified:

1. `src/main.tsx` - Added theme initialization
2. `src/index.css` - Added animations and theme utilities
3. `src/lib/i18n.ts` - Added theme translations
4. `src/pages/Index.tsx` - Integrated theme switcher and animations
5. `src/components/GameRoom.tsx` - Added confetti for King's Cup
6. `src/components/UndercoverGameRoom.tsx` - Added confetti for Undercover

---

## 🎨 Theme Color Reference

Each theme includes:

- **Primary** - Main brand color
- **Secondary** - Supporting color
- **Accent** - Highlight color
- **Background** - Main background (with alpha)
- **Card BG** - Card/panel background (with alpha)
- **Text** - Primary text color
- **Text Secondary** - Dimmed text color
- **Gradient** - Background gradient

Example (Classic theme):

```typescript
{
  primary: "#8b5cf6",      // Purple
  secondary: "#ec4899",    // Pink
  accent: "#f59e0b",       // Amber
  background: "rgba(0, 0, 0, 0.6)",
  cardBg: "rgba(0, 0, 0, 0.4)",
  text: "#ffffff",
  textSecondary: "rgba(255, 255, 255, 0.6)",
  gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
}
```

---

## ✅ Testing Checklist

- [x] Theme switcher appears in correct position
- [x] All 8 themes can be selected
- [x] Theme persists after page reload
- [x] Confetti triggers on King's Cup game end
- [x] Confetti triggers on Undercover game finish
- [x] Background animates smoothly between themes
- [x] Buttons have smooth hover/press effects
- [x] Card flip animation is smooth
- [x] Theme switcher translations work (Thai/English)
- [x] No performance issues with animations
- [x] Mobile responsive (all breakpoints)

---

## 🎉 Result

Your party games app now has:

- 🎨 8 beautiful themes with smooth transitions
- 🎉 Celebration confetti animations
- 💫 Smooth animations throughout
- 🌊 Animated themed backgrounds
- ⚡ 60fps performance
- 🌐 Fully translated UI
- 📱 Mobile-optimized

Enjoy the enhanced visual experience! 🚀
