import { resolveHeartImageSource } from "@/components/animation/resolveBackgroundEffectImage";
import { SkiaHeartTiles } from "@/components/animation/SkiaHeartTiles";
import React from "react";

type Props = {
  heartSource: number;
  width: number;
  height: number;
  isTablet: boolean;
  isFullscreen: boolean;
  isFullscreenPortrait: boolean;
  isPortrait: boolean;
};

/** Heart픽셀배경용 */
export function PixelHeartBackground({
  heartSource,
  width,
  height,
  isTablet,
  isFullscreen,
  isFullscreenPortrait,
  isPortrait,
}: Props) {
  const assetSource = resolveHeartImageSource({
    heartSource,
    isTablet,
    isFullscreen,
    isFullscreenPortrait,
    isPortrait,
  });

  return <SkiaHeartTiles source={assetSource} width={width} height={height} />;
}
