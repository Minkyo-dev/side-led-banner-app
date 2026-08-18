import { Group, Image, useImage } from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { Image as RNImage } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

const MAX_TILE_COUNT = 12;

type Props = {
  source: number;
  width: number;
  height: number;
  translateX: SharedValue<number>;
};

/** Skia 캔버스 안에서 하트 배경을 타일 루프로 그림. 텍스트와 같은 Canvas에서 그려야 프레임 동기화가 맞음 */
export function SkiaHeartTiles({ source, width, height, translateX }: Props) {
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

  const transform = useDerivedValue(() => {
    if (tileWidth <= 0) {
      return [{ translateX: 0 }];
    }
    const loopOffset =
      ((-translateX.value % tileWidth) + tileWidth) % tileWidth;
    return [{ translateX: -loopOffset }];
  }, [tileWidth]);

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
