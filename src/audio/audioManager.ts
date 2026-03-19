import { Audio } from "expo-av";

const trackedSounds = new Set<Audio.Sound>();

export function trackSound(sound: Audio.Sound) {
  trackedSounds.add(sound);
}

export async function untrackAndUnloadSound(sound: Audio.Sound | null | undefined) {
  if (!sound) return;
  trackedSounds.delete(sound);
  try {
    await sound.stopAsync();
  } catch {
    // Ignore stop errors.
  }
  try {
    await sound.unloadAsync();
  } catch {
    // Ignore unload errors.
  }
}

export async function stopAllTrackedAudio() {
  const sounds = Array.from(trackedSounds);
  trackedSounds.clear();

  await Promise.all(
    sounds.map(async (sound) => {
      try {
        await sound.stopAsync();
      } catch {
        // Ignore stop errors.
      }
      try {
        await sound.unloadAsync();
      } catch {
        // Ignore unload errors.
      }
    }),
  );
}
