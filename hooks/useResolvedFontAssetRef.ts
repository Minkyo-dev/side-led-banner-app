import { isRemoteFontMarker, type FontAssetSource } from "@/constants/appFonts";
import { REMOTE_FONT_FACE_SETS } from "@/constants/remoteFonts";
import type { FontAssetRef } from "@/hooks/useCachedSkiaFont";
import { ensureRemoteFontDownloaded } from "@/utils/remoteFontLoader";
import { useEffect, useState } from "react";

/**
 * number(로컬 require id)는 즉시 사용 가능, 원격 폰트 마커는 다운로드가
 * 끝나기 전까지 null을 반환(호출부가 기존 null 처리 경로로 자연스럽게 폴백함).
 */
export function useResolvedFontAssetRef(
  source: FontAssetSource | null,
): FontAssetRef | null {
  const [remoteUri, setRemoteUri] = useState<string | null>(null);
  const marker = source != null && isRemoteFontMarker(source) ? source : null;

  useEffect(() => {
    if (!marker) return;
    let cancelled = false;
    const fontSource = REMOTE_FONT_FACE_SETS[marker.remote][marker.weight];
    if (__DEV__) console.log("[fonts] remote font resolve start", marker.remote, marker.weight);
    ensureRemoteFontDownloaded(fontSource)
      .then((uri) => {
        if (__DEV__) console.log("[fonts] remote font resolve done", marker.remote, marker.weight, uri);
        if (!cancelled) setRemoteUri(uri);
      })
      .catch((err) => {
        if (__DEV__) console.warn("[fonts] remote font resolve failed", marker.remote, marker.weight, err);
      });
    return () => {
      cancelled = true;
    };
  }, [marker?.remote, marker?.weight]);

  if (source == null) return null;
  return typeof source === "number" ? source : remoteUri;
}
