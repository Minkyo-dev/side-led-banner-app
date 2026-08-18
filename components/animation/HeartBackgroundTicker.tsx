import { heartBackgroundTickerStyles as styles } from "@/constants/styles";
import { useSettings } from "@/contexts/settingsContext";
import { Image as ExpoImage } from "expo-image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, Image as RNImage, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface HeartBackgroundTickerProps {
  source: number;
  startTrimPx?: number;
  blurRadius?: number;
}

const MAX_TILE_COUNT = 12;

// Heart 배경 이미지 타일 루프 렌더링용. 텍스트가 길어 이어 붙여서 렌더링
export function HeartBackgroundTicker({
  source,
  startTrimPx = 0,
  blurRadius = 0,
}: HeartBackgroundTickerProps) {
  const { config } = useSettings();
  const speedPxPerSec = config.motion.textMoveSpeed * 3;
  const [size, setSize] = useState({ width: 0, height: 0 });

  // 로컬 이미지 원본 크기 확인
  const resolved = useMemo(() => RNImage.resolveAssetSource(source), [source]);
  // 타일 가로폭 계산용
  const imageAspectRatio =
    resolved?.width && resolved?.height ? resolved.width / resolved.height : 1;
  // 현 컨테이너 높이 기준 타일 폭
  const tileWidth = size.height > 0 ? size.height * imageAspectRatio : 0;
  // 타일 개수
  const tileCount = useMemo(() => {
    if (tileWidth <= 0) return 0;
    const needed = Math.max(3, Math.ceil(size.width / tileWidth) + 2);
    return Math.min(MAX_TILE_COUNT, needed);
  }, [size.width, tileWidth]);
  const tileIndexes = useMemo(
    () => Array.from({ length: tileCount }, (_, i) => i),
    [tileCount],
  );

  // 텍스트 마퀴와 독립적으로 tileWidth 주기로만 반복. 텍스트 translateX(루프마다 순간
  // 리셋됨)를 따라 쓰면 텍스트 루프 시점마다 하트 타일 위치가 같이 튀는 문제가 있었음.
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

  const tickerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) {
      setSize({ width, height });
    }
  }, [size.height, size.width]);

  // 타일 이미지 스타일 오프셋셋
  const imageStyle = useMemo(
    () => ({
      width: tileWidth + startTrimPx,
      height: size.height,
      marginLeft: -startTrimPx,
    }),
    [tileWidth, size.height, startTrimPx],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      <View style={styles.clip}>
        <Animated.View style={[styles.row, tickerStyle]}>
          {tileIndexes.map((i) => (
            <View
              key={`heart-bg-tile-${i}`}
              style={{ width: tileWidth, height: size.height, overflow: "hidden" }}
            >
              <ExpoImage
                source={source}
                style={imageStyle}
                contentFit="fill"
                blurRadius={blurRadius}
              />
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}
