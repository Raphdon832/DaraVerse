import { useState, useEffect } from "react";

export function useAnimatedNumber(endValue: number, duration: number = 1000) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (startTime === null) {
                startTime = currentTime;
            }
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // easeOutExpo
            const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setValue(Math.floor(easing * endValue));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [endValue, duration]);

    return value;
}
