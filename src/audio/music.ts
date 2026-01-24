// Functions are exported and used in useAppSettings.ts and SettingsScreen.tsx
import { AudioPlayer, createAudioPlayer } from "expo-audio";
import type { EventSubscription } from 'expo-modules-core';

let player: AudioPlayer | null = null;
let playbackSub: EventSubscription | null = null;

export async function initMusic() {
    // expo-audio handles audio mode configuration automatically
}

export async function playMainMusic(volume = 0.6) {
    if (player) {
        player.loop = true;
        player.volume = volume;
        if (!player.playing) {
            player.play();
        }
        return;
    }

    player = createAudioPlayer(require("../../assets/audio/main_theme.mp3"));
    player.loop = true;
    player.volume = volume;
    playbackSub?.remove();
    playbackSub = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish && player) {
            player.seekTo(0).then(() => {
                player?.play();
            }).catch((error) => {
                console.error('Music loop restart error:', error);
            });
        }
    });
    player.play();
}

// Reserved for future use (e.g., cleanup on app close)
// @ts-ignore - exported for future use
export async function stopMusic() {
    if (!player) return;
    player.pause();
    playbackSub?.remove();
    playbackSub = null;
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
