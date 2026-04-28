import {
    Blur,
    Canvas,
    Group,
    Paint,
    RuntimeShader,
    Skia,
    Image as SkiaImage,
    useImage,
} from "@shopify/react-native-skia";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

type LayoutEvent = {
  nativeEvent: { layout: { height: number; width: number } };
};

const PIXELATE_SOURCE = Skia.RuntimeEffect.Make(`
  uniform shader content;
  uniform float pixelSize;

  half4 main(vec2 pos) {
    vec2 p = floor(pos / pixelSize) * pixelSize + (pixelSize / 2.0);
    return content.eval(p);
  }
`)!;

interface PixelatedBackgroundImageProps {
  uri: string;
  pixelSize: number;
  blurRadius: number;
}

export function PixelatedBackgroundImage({
  uri,
  pixelSize,
  blurRadius,
}: PixelatedBackgroundImageProps) {
  const image = useImage(uri);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const shaderPixelSize = Math.max(2, pixelSize);
  const shaderBlurRadius = Math.max(0, blurRadius);

  const onLayout = (event: LayoutEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={onLayout}
    >
      {image && size.width > 0 && size.height > 0 ? (
        <Canvas style={StyleSheet.absoluteFill}>
          <Group
            layer={
              <Paint>
                <RuntimeShader
                  source={PIXELATE_SOURCE}
                  uniforms={{ pixelSize: shaderPixelSize }}
                />
                {shaderBlurRadius > 0 ? (
                  <Blur blur={shaderBlurRadius} mode="clamp" />
                ) : null}
              </Paint>
            }
          >
            <SkiaImage
              image={image}
              x={0}
              y={0}
              width={size.width}
              height={size.height}
              fit="cover"
            />
          </Group>
        </Canvas>
      ) : null}
    </View>
  );
}
