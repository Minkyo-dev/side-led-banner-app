import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";


const PROD_AD_UNIT_ID = Platform.select({
  ios: "ca-app-pub-3506417530430977/XXXXXXXXXX",
  android: "ca-app-pub-3506417530430977/XXXXXXXXXX",
  default: TestIds.REWARDED,
});

const isPlaceholderAdUnitId = !PROD_AD_UNIT_ID || PROD_AD_UNIT_ID.includes("XXXXXXXXXX");

const AD_UNIT_ID =
  __DEV__ || isPlaceholderAdUnitId ? TestIds.REWARDED : PROD_AD_UNIT_ID;
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
