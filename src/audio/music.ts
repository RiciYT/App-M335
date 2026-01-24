import { Audio } from "expo-av";

let sound: Audio.Sound | null = null;

export async function initMusic() {
    await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
    });
}

export async function playMainMusic(volume = 0.6) {
    if (sound) return;

    sound = new Audio.Sound();
    await sound.loadAsync(require("../../assets/audio/main_theme.mp3"), {
        shouldPlay: true,
        isLooping: true,
        volume,
    });
    await sound.playAsync();
}

export async function stopMusic() {
    if (!sound) return;
    await sound.stopAsync();
    await sound.unloadAsync();
    sound = null;
}

export async function setMusicEnabled(enabled: boolean) {
    if (!sound) return;
    if (enabled) await sound.playAsync();
    else await sound.pauseAsync();
}

export async function setMusicVolume(volume: number) {
    if (!sound) return;
    await sound.setVolumeAsync(volume);
}
