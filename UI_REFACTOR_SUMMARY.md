# Tilt Maze UI Refactor - Neon/Arcade/Glow Style

## Overview

This document describes the comprehensive UI refactor of the Tilt Maze app to implement a consistent Arcade/Neon/Glow design system. All changes focus on styling and visual consistency while preserving existing functionality and navigation.

## Key Objectives

1. **Icon Consistency**: Replace all emoji icons with a unified icon set (@expo/vector-icons)
2. **Background Simplification**: Reduce to max 2 layers with lower opacity decorative elements
3. **Design System**: Create reusable components and design tokens
4. **Screen-Specific Improvements**: Apply consistent styling across all screens

## Design System Components

### Design Tokens (`src/theme/tokens.ts`)

Centralized constants for consistent styling:

- **Spacing**: xs (4px) to 4xl (40px)
- **Border Radius**: sm (8px) to full (9999px)
- **Border Width & Opacity**: Configurable for light/dark modes
- **Glow Presets**: Primary (violet), Secondary (pink), Mint (cyan), Accent (yellow)
- **Typography**: Font sizes and letter spacing
- **Animation**: Duration presets

Helper functions:
- `createGlow()`: Generate shadow styles for neon glow effects
- `createBorder()`: Generate border styles with opacity

### Reusable Components

#### NeonPrimaryButton
- **Usage**: Primary CTAs (PLAY, PLAY AGAIN)
- **Style**: Hot pink gradient with strong glow
- **Props**: size, icon, loading, disabled

#### NeonSecondaryButton
- **Usage**: Secondary actions (SCORES, SETTINGS, LEADERBOARD)
- **Style**: Glassmorphism with subtle glow, pressed state
- **Props**: size, icon, loading, disabled

#### NeonGhostButton
- **Usage**: Tertiary actions (MENU, LOGOUT)
- **Style**: Minimal text-only with hover state
- **Props**: size, icon, loading, disabled

#### GlassCard
- **Usage**: Content panels, sections
- **Style**: Glassmorphism background with optional glow
- **Variants**: default, elevated, neon
- **Props**: variant, glowColor

#### NeonChip
- **Usage**: Small inline actions (Edit Nickname, TILT, TARGET)
- **Style**: Compact pill with icon
- **Variants**: primary, secondary, mint, accent
- **Props**: variant, size (sm/md), icon, active, onPress

#### SegmentedControl
- **Usage**: Theme selector in Settings
- **Style**: Grouped buttons with active state
- **Props**: options (with icons), value, onChange

## Background System

### ScreenContainer Updates

**Before**: 3+ layers (gradient + scanlines + dots + noise)
**After**: 2 layers maximum (gradient + dots)

Changes:
1. Removed scanline effect
2. Removed noise overlay
3. Reduced dot opacity (0.15 → 0.08)
4. Reduced glow circles from 4 to 2
5. Lowered glow opacity (0.15 → 0.08)

Result: Cleaner, less visually noisy background that keeps focus on content

## Screen-Specific Changes

### MenuScreen

**Icon Changes**:
- 🎮 → `game-controller` (Ionicon)
- 🏆 → `trophy`
- ⚙️ → `settings`
- ✏️ → `pencil`

**Layout Changes**:
- Edit Nickname: Full-width button → inline NeonChip
- PLAY button: Standard → NeonPrimaryButton (xl size)
- Scores/Settings: Outline buttons → NeonSecondaryButton (md size)
- Logout: Standard text → NeonGhostButton

### GameScreen

**Icon Changes**:
- ⏱ → `stopwatch`
- ⚙️ → `pause` (changed functionality label)
- 📱 → `phone-portrait` (TILT chip)
- 🎯 → `locate` (TARGET chip)
- 🎉 → `checkmark-circle` (Victory)
- 💥 → `alert-circle` (Oops)

**Layout Changes**:
- Header: Back/Timer/Pause with Ionicons
- Footer: Reduced height (p-4 → py-2), NeonChips for TILT/TARGET
- Settings Modal: Text +/- → Ionicons `add`/`remove`

**Color Reservation**:
- Cyan (#22D3EE) reserved exclusively for target indicator
- Primary violet used for general UI elements

### ResultScreen

**Icon Changes**:
- 🎉 → `checkmark-circle`
- ⏱ → `stopwatch`
- 🎮 → `refresh` (Play Again)
- 🏆 → `trophy` (Leaderboard)
- ⚠️ → `warning`
- 💪 → `trending-up`

**Conditional Messaging**:
```typescript
// If new personal best
"NEW BEST!" with strong pink glow + trophy icon

// If not new best but has previous
"Keep Trying!" + "Beat your best: {previousBest}s"

// Guest mode
"Guest Mode" + "Sign in to save scores"
```

**Button Order** (changed to prioritize replay):
1. NeonPrimaryButton: Play Again
2. NeonSecondaryButton: Leaderboard
3. NeonGhostButton: Menu

### HighscoresScreen

**Icon Changes**:
- 🥇 → `medal` (gold color)
- 🥈 → `medal-outline` (silver color)
- 🥉 → `ribbon` (bronze color)
- ⏱ → `stopwatch`
- 🎯 → removed (not needed)

**Layout Changes**:
- Always show 10 rows (pad with placeholders if < 10 scores)
- Reduced border thickness for top 3 (heavy → subtle)
- Glow intensity: #1 strongest, #2/#3 weaker
- Medal colors: Gold (#FACC15), Silver (#C0C0C0), Bronze (#CD7F32)

**Placeholder Styling**:
```typescript
{
  userId: 'placeholder-N',
  nickname: '—',
  time: '—',
  opacity: 0.3
}
```

### SettingsScreen

**Icon Changes**:
- 🎨 → `color-palette`
- 🔊 → `volume-high`
- 📳 → `phone-portrait`
- 📱 → `phone-portrait-outline`
- 🗑️ → `trash`
- 🚪 → `log-out`
- ℹ️ → `information-circle`

**Theme Selector**:
**Before**: Cycle button showing "☀️ Light", "🌙 Dark", "🔄 Auto"
**After**: SegmentedControl with 3 options:
- Light: `sunny` icon
- Dark: `moon` icon
- Auto: `phone-portrait` icon

**Sensitivity Display**:
**Before**: Subtitle text only
**After**: NeonChip showing "{value}x" + +/- buttons

## Color Palette

### Primary Colors
- **Electric Violet**: #A855F7 (primary actions, borders)
- **Hot Pink**: #F472B6 (primary buttons, emphasis)
- **Neon Cyan**: #22D3EE (target, success states)
- **Cyber Yellow**: #FACC15 (accents, #1 medal)

### Supporting Colors
- **Success**: #4ADE80
- **Warning**: #FB923C
- **Error**: #F87171
- **Info**: #60A5FA

### Backgrounds
- **Light**: #FAF5FF (light purple tint)
- **Dark**: #0C0118 (deep space purple)

## Typography Hierarchy

### Titles
- Screen titles: 2xl-4xl, font-black, tight tracking
- Card headers: xs, font-black, uppercase, wide tracking (3-4px)

### Body
- Primary text: base-lg, font-bold
- Secondary text: sm, font-medium
- Labels: xs, font-black, uppercase, wide tracking (2px)

### Numbers (Tabular)
- Timer/Scores: xl-5xl, font-black, tabular-nums, tight tracking

## Border & Glow Consistency

### Border Radius
- Small components (chips, pills): 12-16px
- Medium components (buttons, inputs): 16-20px
- Large components (cards, panels): 24-32px

### Border Opacity
- Light mode: 0.2 normal, 0.3 hover, 0.4 active
- Dark mode: 0.3 normal, 0.4 hover, 0.5 active

### Glow Effects
- Buttons: 16-20px radius, 0.4-0.6 opacity
- Cards: 12-16px radius, 0.3-0.4 opacity
- Strong emphasis: 20-24px radius, 0.6-0.7 opacity

## Migration Guide

### Replacing Old Buttons

**Old**:
```tsx
<Button variant="secondary" size="xl" onPress={onPlay} icon={<Text>▶</Text>}>
  PLAY
</Button>
```

**New**:
```tsx
<NeonPrimaryButton size="xl" onPress={onPlay} icon="play">
  PLAY
</NeonPrimaryButton>
```

### Replacing Cards

**Old**:
```tsx
<Card variant="elevated" className="p-5">
  {children}
</Card>
```

**New**:
```tsx
<GlassCard variant="elevated" glowColor="primary">
  {children}
</GlassCard>
```

### Using Chips

**New Pattern**:
```tsx
<NeonChip icon="pencil" variant="primary" size="sm" onPress={onEdit}>
  Edit
</NeonChip>
```

## Testing Checklist

- [x] TypeScript compilation passes
- [x] No security vulnerabilities found (CodeQL scan)
- [x] All emojis removed from UI
- [x] Consistent icon set (Ionicons) across all screens
- [x] Background simplified to 2 layers maximum
- [x] Design tokens and reusable components implemented
- [x] All screen-specific requirements met

## Files Changed

### New Files
- `src/theme/tokens.ts` - Design tokens and helpers
- `src/components/ui/NeonButton.tsx` - Button components
- `src/components/ui/GlassCard.tsx` - Card component
- `src/components/ui/NeonChip.tsx` - Chip component
- `src/components/ui/SegmentedControl.tsx` - Segmented control

### Modified Files
- `src/components/ui/ScreenContainer.tsx` - Simplified background
- `src/components/ui/Common.tsx` - Updated ListItem for Ionicons
- `src/components/ui/index.ts` - Export new components
- `src/screens/MenuScreen.tsx` - Applied new design
- `src/screens/GameScreen.tsx` - Applied new design
- `src/screens/ResultScreen.tsx` - Applied new design
- `src/screens/HighscoresScreen.tsx` - Applied new design + placeholders
- `src/screens/SettingsScreen.tsx` - Applied new design + segmented control
- `src/types/index.ts` - Updated GameScore type
- `package.json` - Added @expo/vector-icons

## Impact Summary

### Improvements
✅ Unified visual language across all screens
✅ Reduced visual noise in backgrounds
✅ Consistent icon system (no more emoji mixing)
✅ Reusable component library for future development
✅ Design tokens for easy theming updates
✅ Improved accessibility with proper icon labels

### Maintained
✅ All existing functionality preserved
✅ Navigation flow unchanged
✅ Game mechanics intact
✅ Firebase integration working
✅ Authentication flow preserved

## Future Enhancements

Potential improvements for future iterations:

1. **Animation**: Add micro-interactions (button press, chip toggle)
2. **Sound Design**: Audio feedback for neon interactions
3. **Haptics**: Enhanced vibration patterns for glow effects
4. **Dark Mode Variants**: Additional color schemes (Neon Blue, Matrix Green)
5. **Accessibility**: High contrast mode, reduced motion support
6. **Component Library**: Extract to separate package for reuse

## Conclusion

This refactor successfully transforms the Tilt Maze app into a cohesive, modern arcade-style experience with consistent neon aesthetics. All requirements met while maintaining backward compatibility with existing features.
