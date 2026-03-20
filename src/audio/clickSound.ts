import { Audio } from "expo-av";
import { isGlobalSoundEnabled } from "./audioPreferences";

const CLICK_SOUND_ASSET = require("../../assets/Sounds/click.mp3");

let clickSound: Audio.Sound | null = null;
let loadPromise: Promise<void> | null = null;

async function ensureLoaded() {
  if (clickSound) {
    return;
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      const { sound } = await Audio.Sound.createAsync(CLICK_SOUND_ASSET, {
        shouldPlay: false,
        volume: 0.45,
      });
      clickSound = sound;
    })().finally(() => {
      loadPromise = null;
    });
  }

  await loadPromise;
}

export async function preloadClickSound() {
  try {
    await ensureLoaded();
  } catch {
    // Fail silently so UI interactions never crash from audio setup.
  }
}

export async function playClickSound() {
  try {
    if (!isGlobalSoundEnabled()) {
      return;
    }
    await ensureLoaded();
    if (!clickSound) {
      return;
    }
    await clickSound.replayAsync();
  } catch {
    // Ignore playback errors to keep button interaction responsive.
  }
}

export async function unloadClickSound() {
  try {
    if (loadPromise) {
      await loadPromise;
    }

    if (!clickSound) {
      return;
    }

    await clickSound.unloadAsync();
    clickSound = null;
  } catch {
    // Ignore cleanup issues.
  }
}
