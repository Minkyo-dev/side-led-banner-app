import { DOT_MATRIX_FRAME_SOURCE, resolveFramePixelDotSize } from "@/components/animation/dotMatrixFrameShader";
import { Group, Image, Paint, RuntimeShader, useImage } from "@shopify/react-native-skia";
import React, { useMemo } from "react";

type Props = {
  source: number;
  width: number;
  height: number;
  previewInset: number;
  pixelShaderSize: number;
};

/** 말풍선 PNG — BackgroundEffectLayer와 동일 fill, 어두운 테두리만 도트 레이어 */
export function PixelSpeechBubbleFrame({
  source,
  width,
  height,
  previewInset,
  pixelShaderSize,
}: Props) {
  const image = useImage(source);

  const layout = useMemo(
    () => ({
      x: 0,
      y: -previewInset,
      width,
      height: height + previewInset * 2,
    }),
    [width, height, previewInset],
  );

  const frameDotSize = resolveFramePixelDotSize(pixelShaderSize);

  const frameShaderLayer = useMemo(
    () => (
      <Paint>
        <RuntimeShader
          source={DOT_MATRIX_FRAME_SOURCE}
          uniforms={{
            dotSize: frameDotSize,
            dotRadius: frameDotSize * 0.46,
            lineThreshold: 0.42,
          }}
        />
      </Paint>
    ),
    [frameDotSize],
  );

  if (!image) return null;

  return (
    <Group layer={frameShaderLayer}>
      <Image
        image={image}
        x={layout.x}
        y={layout.y}
        width={layout.width}
        height={layout.height}
        fit="fill"
      />
    </Group>
  );
};
