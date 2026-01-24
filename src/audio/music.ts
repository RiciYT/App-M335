// Functions are exported and used in useAppSettings.ts and SettingsScreen.tsx
import { AudioPlayer, createAudioPlayer } from "expo-audio";

let player: AudioPlayer | null = null;

export async function initMusic() {
    // expo-audio handles audio mode configuration automatically
}

export async function playMainMusic(volume = 0.6) {
    if (player) return;

    player = createAudioPlayer(require("../../assets/audio/main_theme.mp3"));
    player.loop = true;
    player.volume = volume;
    player.play();
}

// Reserved for future use (e.g., cleanup on app close)
// @ts-ignore - exported for future use
export async function stopMusic() {
    if (!player) return;
    player.pause();
    player.release();
    player = null;
}

export async function setMusicEnabled(enabled: boolean) {
    if (!player) return;
    if (enabled) player.play();
    else player.pause();
}

// Reserved for future use (e.g., volume slider in settings)
// @ts-ignore - exported for future use
export async function setMusicVolume(volume: number) {
    if (!player) return;
    player.volume = volume;
}
