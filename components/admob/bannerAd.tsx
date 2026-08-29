import React from "react";
import { Platform, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

// 실제 광고 단위 ID (개발 단계에서는 테스트 광고 단위 ID로 대체)
const PROD_BANNER_AD_UNIT_ID = Platform.select({
  ios: "ca-app-pub-3506417530430977/4875843768",
  android: "ca-app-pub-3506417530430977/9971880471",
  default: TestIds.BANNER,
});

const isPlaceholderAdUnitId =
  !PROD_BANNER_AD_UNIT_ID || PROD_BANNER_AD_UNIT_ID.includes("XXXXXXXXXX");

const useGoogleTestAds =
  __DEV__ || process.env.EXPO_PUBLIC_INCLUDE_GOOGLE_TEST_ADS === "true";

const BANNER_AD_UNIT_ID =
  useGoogleTestAds || isPlaceholderAdUnitId
    ? TestIds.BANNER
    : PROD_BANNER_AD_UNIT_ID;

export default function BannerAdComponent({ style }: any) {
  // Banner Ad Component
  return (
    <View style={[{ alignItems: "center", minHeight: 50 }, style]}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log("Banner ad loaded");
        }}
        onAdFailedToLoad={(error) => {
          console.error("Banner ad failed to load", error);
        }}
      />
    </View>
  );
}
