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

const AD_RETRY_DELAY_MS = 2000;

const sharedAd = RewardedAd.createForAdRequest(AD_UNIT_ID, {
  requestNonPersonalizedAdsOnly: true,
});
sharedAd.load();

export function useRewardedAd(onRewardEarned: () => void) {
  const [loaded, setLoaded] = useState(sharedAd.loaded);
  const onRewardEarnedRef = useRef(onRewardEarned);
  onRewardEarnedRef.current = onRewardEarned;

  useEffect(() => {
    if (sharedAd.loaded) setLoaded(true);

    const unsubs = [
      sharedAd.addAdEventListener(RewardedAdEventType.LOADED, () =>
        setLoaded(true),
      ),
      sharedAd.addAdEventListener(AdEventType.CLOSED, () => {
        setLoaded(false);
        sharedAd.load();
      }),
      sharedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        onRewardEarnedRef.current();
      }),
      sharedAd.addAdEventListener(AdEventType.ERROR, (error) => {
        if (__DEV__) console.warn("[rewardedAd] load error", error);
        setLoaded(false);
        setTimeout(() => sharedAd.load(), AD_RETRY_DELAY_MS);
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, []);

  const show = useCallback(() => {
    sharedAd.show();
  }, []);

  return { loaded, show };
}
