import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, Text } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

type BurstDirection = "up" | "down";

interface EmojiBurstProps {
    emoji: string;
    direction: BurstDirection;
    count?: number;
}

interface Particle {
    id: number;
    x: number;
    startY: number;
    endY: number;
    delay: number;
    duration: number;
    wobbleX: number;
    size: number;
    rotation: string;
}

/**
 * iMessage‑style emoji burst effect.
 *
 * - `direction="up"` → emojis float upward from the bottom (surprised / excited / scared)
 * - `direction="down"` → emojis drift downward from the top  (thinking)
 *
 * Each particle gets a random horizontal position, random wobble,
 * random size and random timing for a chaotic, organic feel.
 *
 * Haptics: a staccato burst of taps fires in sync with the particles.
 * "up" → rapid-fire light taps building to a medium crescendo
 * "down" → softer, slower taps for a contemplative feel
 */
export default function EmojiBurst({
    emoji,
    direction,
    count = 10,
}: EmojiBurstProps) {
    const particles = useMemo<Particle[]>(() => {
        const items: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const x = Math.random() * (SCREEN_W - 40);
            const wobbleX = (Math.random() - 0.5) * 80; // random horizontal drift
            const size = 45 + Math.random() * 45; // 45..90px
            const delay = Math.random() * 400; // stagger 0..400ms
            const duration = 1400 + Math.random() * 1000; // 1.4..2.4s
            const rotation = `${Math.floor(Math.random() * 60 - 30)}deg`;

            const startY = direction === "up" ? SCREEN_H + 20 : -60;
            const endY = direction === "up" ? -80 : SCREEN_H + 40;

            items.push({ id: i, x, startY, endY, delay, duration, wobbleX, size, rotation });
        }
        return items;
    }, [emoji, direction, count]);

    /* Intelligent haptic pattern — synced to particle timing */
    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];

        // Sort particles by delay so haptics build naturally
        const sorted = [...particles].sort((a, b) => a.delay - b.delay);

        sorted.forEach((p, idx) => {
            const t = setTimeout(() => {
                if (direction === "up") {
                    // Rapid crescendo: light taps ramping to a medium hit on the last one
                    if (idx === sorted.length - 1) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    } else {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                } else {
                    // Contemplative: every other particle gets a soft tap
                    if (idx % 2 === 0) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                }
            }, p.delay);
            timers.push(t);
        });

        // Closing flourish after all particles have launched
        const finishDelay = direction === "up" ? 500 : 700;
        timers.push(
            setTimeout(() => {
                Haptics.impactAsync(
                    direction === "up"
                        ? Haptics.ImpactFeedbackStyle.Heavy
                        : Haptics.ImpactFeedbackStyle.Light
                );
            }, finishDelay)
        );

        return () => timers.forEach(clearTimeout);
    }, [particles, direction]);

    return (
        <>
            {particles.map((p) => (
                <MotiView
                    key={p.id}
                    from={{
                        opacity: 0.9,
                        translateY: p.startY,
                        translateX: p.x,
                        scale: 0.3,
                        rotate: "0deg",
                    }}
                    animate={{
                        opacity: 0,
                        translateY: p.endY,
                        translateX: p.x + p.wobbleX,
                        scale: 1,
                        rotate: p.rotation,
                    }}
                    transition={{
                        type: "timing",
                        duration: p.duration,
                        delay: p.delay,
                    }}
                    style={styles.particle}
                    pointerEvents="none"
                >
                    <Text style={[styles.emoji, { fontSize: p.size }]}>{emoji}</Text>
                </MotiView>
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    particle: {
        position: "absolute",
        zIndex: 50,
        top: 0,
        left: 0,
    },
    emoji: {
        textAlign: "center",
    },
});
