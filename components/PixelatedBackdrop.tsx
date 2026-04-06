import type { SkImage } from "@shopify/react-native-skia";
import {
  Canvas,
  FilterMode,
  Group,
  Image as SkiaImage,
  makeImageFromView,
} from "@shopify/react-native-skia";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

/**
 * Pixel 효과 계획획
 * - BackdropFilter+RuntimeShader는 RN 뷰를 뒷면으로 잡지 못해 화면에 변화가 없을 수 있음.
 * - captureRef 뷰를 makeImageFromView로 주기적으로 캡처한 뒤, Skia Image를 축소 후
 *   scale + FilterMode.Nearest로 블록 느낌을 내었습니다
 * - 웹은 makeImageFromView 스텁 제약으로 Pixel 시 자식만 표시.
 * 전체적으로 미완성이라 모자이크 효과 적용 안 될 수 있습니다.
 */
const CAPTURE_INTERVAL_MS = 70;

type PixelatedBackdropProps = {
  active: boolean;
  pixelSize: number;
  captureRef: React.RefObject<View | null>;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

function disposeSkImage(img: SkImage | null) {
  if (img && typeof (img as { dispose?: () => void }).dispose === "function") {
    (img as { dispose: () => void }).dispose();
  }
}

export function PixelatedBackdrop({
  active,
  pixelSize,
  captureRef,
  children,
  style,
}: PixelatedBackdropProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [snapshot, setSnapshot] = useState<SkImage | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  const block = useMemo(
    () => Math.max(2, Math.min(32, Math.floor(pixelSize))),
    [pixelSize],
  );

  const canPixelate =
    Platform.OS !== "web" &&
    active &&
    pixelSize >= 1 &&
    size.width > 0 &&
    size.height > 0;

  useEffect(() => {
    if (!canPixelate) {
      setSnapshot((prev) => {
        disposeSkImage(prev);
        return null;
      });
      return;
    }

    let cancelled = false;

    const capture = () => {
      const target = captureRef?.current;
      if (!target) return;
      makeImageFromView(captureRef)
        .then((img) => {
          if (cancelled || !img) {
            disposeSkImage(img);
            return;
          }
          setSnapshot((prev) => {
            disposeSkImage(prev);
            return img;
          });
        })
        .catch(() => {});
    };

    capture();
    const id = setInterval(capture, CAPTURE_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
      setSnapshot((prev) => {
        disposeSkImage(prev);
        return null;
      });
    };
  }, [canPixelate, captureRef, size.width, size.height]);
/**
 * pixel 출력 디버깅용 로그
 */
  useEffect(() => {
    if (!__DEV__) return;
    console.log("[PixelatedBackdrop]", {
      active,
      pixelSize,
      block,
      size,
      canPixelate,
      hasSnapshot: snapshot != null,
      platform: Platform.OS,
    });
  }, [active, pixelSize, block, size, canPixelate, snapshot]);

  const showCanvas = canPixelate && snapshot != null;
  const w = size.width;
  const h = size.height;
  const dw = w / block;
  const dh = h / block;

  return (
    <View
      style={[styles.wrap, style]}
      onLayout={onLayout}
      pointerEvents="box-none"
    >
      {children}
      {showCanvas ? (
        <Canvas
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          opaque={false}
        >
          <Group transform={[{ scale: block }]}>
            <SkiaImage
              image={snapshot}
              x={0}
              y={0}
              width={dw}
              height={dh}
              fit="fill"
              sampling={{ filter: FilterMode.Nearest }}
            />
          </Group>
        </Canvas>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    overflow: "hidden",
  },
});
