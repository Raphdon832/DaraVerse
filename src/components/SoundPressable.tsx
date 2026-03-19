import { useCallback } from "react";
import { Pressable as ReactNativePressable, type PressableProps } from "react-native";

import { playClickSound } from "../audio/clickSound";

type SoundPressableProps = PressableProps & {
  disableClickSound?: boolean;
};

export default function SoundPressable({
  onPress,
  disableClickSound = false,
  ...rest
}: SoundPressableProps) {
  const handlePress = useCallback<NonNullable<PressableProps["onPress"]>>(
    (event) => {
      if (!disableClickSound) {
        void playClickSound();
      }
      onPress?.(event);
    },
    [disableClickSound, onPress],
  );

  return (
    <ReactNativePressable
      {...rest}
      onPress={onPress ? handlePress : undefined}
    />
  );
}
