import { MotiPressable as BaseMotiPressable } from "moti/interactions";
import { useCallback, type ComponentProps } from "react";

import { playClickSound } from "../audio/clickSound";

type SoundMotiPressableProps = ComponentProps<typeof BaseMotiPressable> & {
  disableClickSound?: boolean;
};

export default function SoundMotiPressable({
  onPress,
  disableClickSound = false,
  ...rest
}: SoundMotiPressableProps) {
  const handlePress = useCallback<NonNullable<SoundMotiPressableProps["onPress"]>>(
    () => {
      if (!disableClickSound) {
        void playClickSound();
      }
      onPress?.();
    },
    [disableClickSound, onPress],
  );

  return (
    <BaseMotiPressable
      {...rest}
      onPress={onPress ? handlePress : undefined}
    />
  );
}
