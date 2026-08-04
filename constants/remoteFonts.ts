/** GitHub Release에 올려두고 앱 실행 시 다운로드하는 대용량 CJK 폰트 매니페스트(테스트용) */

export interface RemoteFontSource {
  url: string;
  fileName: string;
}

export interface RemoteFontFaceSet {
  regular: RemoteFontSource;
  bold: RemoteFontSource;
}

const RELEASE_BASE =
  "https://github.com/Minkyo-dev/side-led-banner-app/releases/download/fonts-v1";

/** 앱 번들에서 빼고 원격 다운로드로 전환할 폰트 id */
export const REMOTE_FONT_FACE_SETS = {
  chiron_goround_tc: {
    regular: {
      url: `${RELEASE_BASE}/ChironGoRoundTC-Medium.ttf`,
      fileName: "ChironGoRoundTC-Medium.ttf",
    },
    bold: {
      url: `${RELEASE_BASE}/ChironGoRoundTC-Black.ttf`,
      fileName: "ChironGoRoundTC-Black.ttf",
    },
  },
} as const satisfies Record<string, RemoteFontFaceSet>;

export type RemoteFontId = keyof typeof REMOTE_FONT_FACE_SETS;

export function isRemoteFontId(id: string): id is RemoteFontId {
  return Object.prototype.hasOwnProperty.call(REMOTE_FONT_FACE_SETS, id);
}
