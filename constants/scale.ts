import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** 폰 기준폭(iPhone 375 기준). 태블릿처럼 이보다 넓은 화면에서만 확대 스케일이 붙는다 */
const SCALE_BASE_WIDTH = 375;
/** 화면폭 비율의 상/하한: 아주 작은 폰에서 과하게 줄거나 큰 태블릿에서 과하게 커지는 것을 방지 */
const SCALE_MIN_RATIO = 0.9;
const SCALE_MAX_RATIO = 1.6;
/** 화면폭 비율을 그대로 곱하지 않고 일부만 반영 (완화 계수) */
const SCALE_MODERATION_FACTOR = 0.4;

/** 폰 기준 고정 px 값을 태블릿 등 큰 화면에서 완만하게 키워주는 스케일러 */
export function moderateScale(size: number): number {
  const widthRatio = Math.min(
    Math.max(SCREEN_WIDTH / SCALE_BASE_WIDTH, SCALE_MIN_RATIO),
    SCALE_MAX_RATIO,
  );
  const moderatedRatio = 1 + (widthRatio - 1) * SCALE_MODERATION_FACTOR;
  return Math.round(size * moderatedRatio);
}
