import { useSettings } from "@/contexts/settingsContext";
import { Group, Image, useImage } from "@shopify/react-native-skia";
import React, { useEffect, useMemo } from "react";
import { Image as RNImage } from "react-native";
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const MAX_TILE_COUNT = 12;

type Props = {
  source: number;
  width: number;
  height: number;
};

/**
 * Skia 캔버스 안에서 하트 배경을 타일 루프로 그림. 텍스트 마퀴의 translateX(루프마다
 * -totalShift에서 0으로 순간 리셋됨)를 그대로 쓰면 텍스트 루프 시점마다 하트 타일 주기와
 * 안 맞아 값이 튀어 움찔거려 보임 — 그래서 자체 tileWidth 주기로 독립적으로 반복시킴.
 */
export function SkiaHeartTiles({ source, width, height }: Props) {
  const { config } = useSettings();
  const speedPxPerSec = config.motion.textMoveSpeed * 3;
  const image = useImage(source);

  const tileWidth = useMemo(() => {
    if (height <= 0) return 0;
    const resolved = RNImage.resolveAssetSource(source);
    const aspect =
      resolved?.width && resolved?.height
        ? resolved.width / resolved.height
        : 1;
    return height * aspect;
  }, [source, height]);

  const tileCount = useMemo(() => {
    if (tileWidth <= 0 || width <= 0) return 0;
    const needed = Math.max(3, Math.ceil(width / tileWidth) + 2);
    return Math.min(MAX_TILE_COUNT, needed);
  }, [width, tileWidth]);

  const offsetX = useSharedValue(0);

  useEffect(() => {
    if (tileWidth <= 0 || speedPxPerSec <= 0) {
      cancelAnimation(offsetX);
      offsetX.value = 0;
      return;
    }
    const duration = (tileWidth / speedPxPerSec) * 1000;
    cancelAnimation(offsetX);
    offsetX.value = 0;
    offsetX.value = withRepeat(
      withTiming(-tileWidth, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [tileWidth, speedPxPerSec, offsetX]);

  const transform = useDerivedValue(() => [{ translateX: offsetX.value }], [offsetX]);

  const tiles = useMemo(
    () => Array.from({ length: tileCount }, (_, i) => i),
    [tileCount],
  );

  if (!image || tileWidth <= 0 || tileCount <= 0) {
    return null;
  }

  return (
    <Group transform={transform}>
      {tiles.map((i) => (
        <Image
          key={`heart-tile-${i}`}
          image={image}
          x={i * tileWidth}
          y={0}
          width={tileWidth}
          height={height}
          fit="fill"
        />
      ))}
    </Group>
  );
}
