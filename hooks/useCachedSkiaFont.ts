import type { SkFont, SkTypeface } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { Image } from "react-native";

/**
 * Skia의 기본 useFont/useTypeface는 컴포넌트 인스턴스마다 캐시가 없어서,
 * 같은 폰트를 다시 고르거나(뒤로가기) 같은 폰트를 여러 컴포넌트(미리보기+전체화면)가
 * 동시에 쓸 때마다 TTF를 매번 새로 디코딩합니다. 여기서는 asset(require id) 기준으로
 * 앱 전역에 한 번만 디코딩해서 공유합니다.
 */
const typefaceCache = new Map<number, SkTypeface | null>();
const pendingTypefaceLoads = new Map<number, Promise<SkTypeface | null>>();

function loadTypeface(asset: number): Promise<SkTypeface | null> {
  const cached = typefaceCache.get(asset);
  if (cached !== undefined) return Promise.resolve(cached);

  const pending = pendingTypefaceLoads.get(asset);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const uri = Image.resolveAssetSource(asset).uri;
      const data = await Skia.Data.fromURI(uri);
      const typeface = data ? Skia.Typeface.MakeFreeTypeFaceFromData(data) : null;
      typefaceCache.set(asset, typeface);
      return typeface;
    } catch {
      // IO 실패는 일시적일 수 있어 영구 캐시하지 않고 재시도 가능하게 두겠습니다
      return null;
    } finally {
      pendingTypefaceLoads.delete(asset);
    }
  })();

  pendingTypefaceLoads.set(asset, promise);
  return promise;
}

/** 부팅 시점 등에서 캐시를 미리 데워두기 위한 fire-and-forget 프리로드 */
export function preloadSkiaTypefaces(assets: number[]): void {
  assets.forEach((asset) => {
    void loadTypeface(asset);
  });
}

const RETRY_DELAYS_MS = [500, 1500, 3000];

/** asset 기준 전역 캐시를 쓰는 useFont 대체 훅. */
export function useCachedSkiaFont(
  asset: number | null | undefined,
  size: number,
): SkFont | null {
  const [typeface, setTypeface] = useState<SkTypeface | null>(() =>
    asset != null ? typefaceCache.get(asset) ?? null : null,
  );

  useEffect(() => {
    if (asset == null) {
      setTypeface(null);
      return;
    }
    const cached = typefaceCache.get(asset);
    if (cached !== undefined) {
      setTypeface(cached);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // 첫 로드가 실패해도(iOS 저사양/태블릿에서 초기 IO 지연 등) 마퀴 애니메이션이
    // textWidth=0 상태로 영구히 멈추지 않도록 짧은 백오프로 재시도한다
    const attemptLoad = (retryIndex: number) => {
      loadTypeface(asset).then((tf) => {
        if (cancelled) return;
        if (tf) {
          setTypeface(tf);
          return;
        }
        const delay = RETRY_DELAYS_MS[retryIndex];
        if (delay == null) {
          setTypeface(null);
          return;
        }
        timer = setTimeout(() => attemptLoad(retryIndex + 1), delay);
      });
    };
    attemptLoad(0);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [asset]);

  return useMemo(() => (typeface ? Skia.Font(typeface, size) : null), [typeface, size]);
}
