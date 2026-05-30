import {
    GOOGLE_ADMOV_ANDROID_APP_ID,
    GOOGLE_ADMOV_IOS_APP_ID,
} from "@/constants/adMobs";
import React, { useRef } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import {
    BannerAd,
    BannerAdSize,
    TestIds,
    useForeground,
} from "react-native-google-mobile-ads";

type AdUnitIdType = string;

const AD_UNIT_ID: AdUnitIdType = Platform.select({
  ios: __DEV__ ? TestIds.BANNER : GOOGLE_ADMOV_IOS_APP_ID,
  android: __DEV__ ? TestIds.BANNER : GOOGLE_ADMOV_ANDROID_APP_ID,
}) as AdUnitIdType;

interface AdmobBannerAdProps {
  paramMarginTop?: number;
  paramMarginBottom?: number;
}

const AdmobBannerAd: React.FC<AdmobBannerAdProps> = ({
  paramMarginTop = 0,
  paramMarginBottom = 20,
}) => {
  const bannerRef = useRef<BannerAd | null>(null);
  const screenWidth = Dimensions.get("window").width;

  useForeground(() => {
    if (Platform.OS === "ios") {
      bannerRef.current?.load();
    }
  });

  const getBannerSize = () => {
    if (screenWidth >= 600) return BannerAdSize.FULL_BANNER;
    if (screenWidth >= 480) return BannerAdSize.LARGE_BANNER;
    return BannerAdSize.BANNER;
  };

  return (
    <View
      style={[
        styles.container,
        { marginTop: paramMarginTop, marginBottom: paramMarginBottom },
      ]}
    >
      <BannerAd ref={bannerRef} unitId={AD_UNIT_ID} size={getBannerSize()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
});

export default AdmobBannerAd;
