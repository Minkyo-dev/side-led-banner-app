/**
 * 썸네일은 나중에에 `assets/images/sunnyApps/` 등으로 추가한 뒤 `thumbnail` 필드에
 * `require(...)`를 채워주세요. 비어 있으면 이니셜로 된 플레이스홀더가 표시됩니다.
 */
import type { ImageSourcePropType } from "react-native";

export interface SunnyAppEntry {
  id: string;
  name: string;
  appStoreUrl: string;
  playStoreUrl: string;
  thumbnail?: ImageSourcePropType;
}

export const SUNNY_APPS: SunnyAppEntry[] = [
  {
    id: "sky_peacemaker",
    name: "Sky Peacemaker",
    appStoreUrl:
      "https://apps.apple.com/ca/app/sky-peacemaker-finger-force/id6744907473",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.mwm.ffigher.gg",
  },
  {
    id: "world_movie_trailer",
    name: "World Movie Trailer",
    appStoreUrl:
      "https://apps.apple.com/ca/app/world-movie-trailer/id6670228768",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.sunnyinnolab.worldMovieTrailer",
  },
  {
    id: "world_book_ranking",
    name: "World Book Ranking",
    appStoreUrl: "https://apps.apple.com/ca/app/world-book-ranking/id6755462071",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.worldbookranking",
  },
  {
    id: "simply_multi_timer",
    name: "Simply Multi Timer",
    appStoreUrl: "https://apps.apple.com/us/app/simply-multi-timer/id6746514607",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.sunnyinnolab.sunnysmtapp2",
  },
  {
    id: "wisdom_qclock",
    name: "Wisdom Qclock",
    appStoreUrl: "https://apps.apple.com/ca/app/wisdom-qclock/id6751124999",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.sunnyinnolab.qclock",
  },
  {
    id: "play_memo",
    name: "Play Memo",
    appStoreUrl: "https://apps.apple.com/us/app/play-memo/id6746741354",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.sunnyinnolab.playmemo",
  },
  {
    id: "find_four",
    name: "Find Four",
    appStoreUrl:
      "https://apps.apple.com/ca/app/find-four-find-4-differences/id6478101361",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.mwm.findfour.gg",
  },
  {
    id: "dual_flashlight",
    name: "Dual Flashlight",
    appStoreUrl: "https://apps.apple.com/app/dual-flashlight/id6741048362",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.sunnyinnolab.dualflashlight2",
  },
  {
    id: "scanatory",
    name: "Scanatory",
    appStoreUrl: "https://apps.apple.com/ph/app/scanatory/id6757365297",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.sunnyinnolab.scanatory",
  },
  {
    id: "histree",
    name: "Histree",
    appStoreUrl: "https://apps.apple.com/ca/app/histree/id6754057761",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.todayhistory.todayhistory",
  },
  {
    id: "decibella",
    name: "Decibella",
    appStoreUrl: "https://apps.apple.com/ca/app/decibella/id6751743532",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=cc.cavecafe.app.decibella",
  },
];
