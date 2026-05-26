import React from "react";
import { Platform, View } from "react-native";
import {
    BannerAd,
    BannerAdSize,
    TestIds,
} from "react-native-google-mobile-ads";

// Define your ad unit IDs
const BANNER_AD_UNIT_ID = Platform.select({
  ios: "ca-app-pub-3506417530430977/4875843768",
  android: "ca-app-pub-3506417530430977/9971880471",
});

export default function BannerAdComponent({ style }: any) {
  // Banner Ad Component
  return (
    <View style={[{ alignItems: "center" }, style]}>
      <BannerAd
        unitId={TestIds.BANNER}
        size={BannerAdSize.FULL_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
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
