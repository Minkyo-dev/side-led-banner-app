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
  zhengfeng_brush: {
    regular: {
      url: `${RELEASE_BASE}/MasaFont-Regular.ttf`,
      fileName: "MasaFont-Regular.ttf",
    },
    bold: {
      url: `${RELEASE_BASE}/MasaFont-Bold.ttf`,
      fileName: "MasaFont-Bold.ttf",
    },
  },
  chiron_hei_hk: {
    regular: {
      url: `${RELEASE_BASE}/ChironHeiHK-Medium.ttf`,
      fileName: "ChironHeiHK-Medium.ttf",
    },
    bold: {
      url: `${RELEASE_BASE}/ChironHeiHK-Black.ttf`,
      fileName: "ChironHeiHK-Black.ttf",
    },
  },
} as const satisfies Record<string, RemoteFontFaceSet>;

export type RemoteFontId = keyof typeof REMOTE_FONT_FACE_SETS;
