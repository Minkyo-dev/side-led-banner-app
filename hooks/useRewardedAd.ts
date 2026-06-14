import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

// TODO: 스토어 제출 전 아래 주석 해제 후 실제 ID 입력해주세요
// const AD_UNIT_ID = __DEV__
//   ? TestIds.REWARDED
//   : Platform.select({
//       ios: "ca-app-pub-3506417530430977/XXXXXXXXXX",
//       android: "ca-app-pub-3506417530430977/XXXXXXXXXX",
//       default: TestIds.REWARDED,
//     }) ?? TestIds.REWARDED;
const AD_UNIT_ID = TestIds.REWARDED;

export function useRewardedAd(onRewardEarned: () => void) {
  const [loaded, setLoaded] = useState(false);
  const onRewardEarnedRef = useRef(onRewardEarned);
  onRewardEarnedRef.current = onRewardEarned;

  const adRef = useRef<RewardedAd | null>(null);

  useEffect(() => {
    const ad = RewardedAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });
    adRef.current = ad;

    const unsubs = [
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => setLoaded(true)),
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        setLoaded(false);
        ad.load();
      }),
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        onRewardEarnedRef.current();
      }),
    ];

    ad.load();

    return () => unsubs.forEach((u) => u());
  }, []);

  const show = useCallback(() => {
    adRef.current?.show();
  }, []);

  return { loaded, show };
}
