import {
  GOOGLE_ADMOV_ANDROID_REWARDED_ID,
  GOOGLE_ADMOV_IOS_REWARDED_ID,
} from "@/constants/adMobs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { TestIds, useRewardedAd } from "react-native-google-mobile-ads";

const REWARDED_AD_UNIT_ID =
  Platform.OS === "web"
    ? null
    : (Platform.select({
        ios: __DEV__ ? TestIds.REWARDED : GOOGLE_ADMOV_IOS_REWARDED_ID,
        android: __DEV__
          ? TestIds.REWARDED
          : GOOGLE_ADMOV_ANDROID_REWARDED_ID,
      }) ?? null);

type Options = {
  onEarnedReward?: () => void;
};

export function useRewardedAdShow({ onEarnedReward }: Options = {}) {
  const [pendingShow, setPendingShow] = useState(false);
  const rewarded = useRewardedAd(REWARDED_AD_UNIT_ID);
  const onEarnedRef = useRef(onEarnedReward);
  const earnedHandledRef = useRef(false);

  onEarnedRef.current = onEarnedReward;

  useEffect(() => {
    if (REWARDED_AD_UNIT_ID) {
      rewarded.load();
    }
  }, [rewarded.load]);

  useEffect(() => {
    if (rewarded.isClosed) {
      earnedHandledRef.current = false;
      rewarded.load();
    }
  }, [rewarded.isClosed, rewarded.load]);

  useEffect(() => {
    if (rewarded.isEarnedReward && !earnedHandledRef.current) {
      earnedHandledRef.current = true;
      onEarnedRef.current?.();
    }
  }, [rewarded.isEarnedReward]);

  useEffect(() => {
    if (pendingShow && rewarded.isLoaded) {
      setPendingShow(false);
      rewarded.show();
    }
  }, [pendingShow, rewarded.isLoaded, rewarded.show]);

  const showRewardedAd = useCallback(() => {
    if (Platform.OS === "web" || !REWARDED_AD_UNIT_ID) {
      return;
    }

    if (rewarded.isLoaded) {
      rewarded.show();
      return;
    }

    setPendingShow(true);
    rewarded.load();
  }, [rewarded.isLoaded, rewarded.show, rewarded.load]);

  return {
    showRewardedAd,
    isLoaded: rewarded.isLoaded,
    error: rewarded.error,
  };
}
