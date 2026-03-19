import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';

const { width, height } = Dimensions.get('window');

const PIECES = Array.from({ length: 80 });
const COLORS = ['#FFC107', '#E91E63', '#00BCD4', '#8BC34A', '#9C27B0', '#FF5722', '#3F51B5'];

export default function EpicBadgeBurst({ onAnimationFinish }: { onAnimationFinish?: () => void }) {
    const [active, setActive] = useState(false);

    useEffect(() => {
        setActive(true);
        const timer = setTimeout(() => {
            if (onAnimationFinish) onAnimationFinish();
        }, 4000); // Wait until animation completely finishes to unmount.
        return () => clearTimeout(timer);
    }, [onAnimationFinish]);

    if (!active) return null;

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {PIECES.map((_, i) => {
                const color = COLORS[i % COLORS.length];
                const isCircle = i % 2 === 0;
                const isTriangle = i % 3 === 0;
                const size = Math.random() * 12 + 10;

                const startX = width / 2;
                const startY = height / 3;

                // Expanded outward calculation for more screen coverage
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * (width * 1.5) + (width * 0.2);
                const endX = startX + Math.cos(angle) * radius;
                const endY = startY + Math.sin(angle) * Math.abs(radius) + (height * 0.5); // Add a fall drop arc
                const rotation = Math.random() * 720 + 360;

                return (
                    <MotiView
                        key={i}
                        from={{
                            left: startX,
                            top: startY,
                            rotate: '0deg',
                            scale: 0.1,
                            opacity: 1,
                        }}
                        animate={{
                            left: endX,
                            top: endY,
                            rotate: `${rotation}deg`,
                            scale: Math.random() * 0.5 + 1,
                            opacity: 0,
                        }}
                        transition={{
                            type: 'timing',
                            duration: Math.random() * 2000 + 1500,
                            delay: Math.random() * 300,
                        }}
                        style={[
                            {
                                position: 'absolute',
                                width: size,
                                height: size,
                                backgroundColor: isTriangle ? 'transparent' : color,
                                borderRadius: isCircle && !isTriangle ? size / 2 : 2,
                            },
                            isTriangle && {
                                borderLeftWidth: size / 2,
                                borderRightWidth: size / 2,
                                borderBottomWidth: size,
                                borderLeftColor: 'transparent',
                                borderRightColor: 'transparent',
                                borderBottomColor: color,
                            }
                        ]}
                    />
                );
            })}
        </View>
    );
}
