export type ComputeMarqueeSegmentCountParams = {
  viewportWidthPx: number;
  textWidthPx: number;
  spacerPx: number;
  minSegments: number;
  maxSegments: number;
  /** 화면 너비로 나눈 뒤, 여유로 몇 칸 더 깔지 (끊김·글로우 가장자리용) */
  bufferSegments?: number;
};

/** 마퀴로 글을 몇 번 옆으로 반복 깔지 정할 때 쓰고, 화면 너비에 맞춰 너무 많아지지 않게 막는닫ㅁㅁ*/
export function computeMarqueeSegmentCount(
  p: ComputeMarqueeSegmentCountParams,
): number {
  const buffer = p.bufferSegments ?? 2;
  const period = p.textWidthPx + p.spacerPx;
  if (period <= 0 || p.viewportWidthPx <= 0) {
    return p.minSegments;
  }
  const tiles = Math.ceil(p.viewportWidthPx / period) + buffer;
  return Math.min(p.maxSegments, Math.max(p.minSegments, tiles));
}
