# LED Banner App

사용자가 입력한 텍스트를 Banner 형태로 표시하는 앱 입니다.

## Features

- 사용자가 입력한 텍스트를 Banner 형태로 표시.
- 한 줄/ 여러 줄 재생 모드 선택 가능.
- 텍스트 스타일, 배경 스타일, 이펙트 설정 가능
- ios/ android 모두 지원

## 사전 요구사항

- Node.js 18+
- npm 또는 yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- (선택) EAS CLI — 빌드/배포 시 필요
- Android Studio 설치

## 설치 및 실행 방법

1. 프로젝트 클론

```bash
git clone https://github.com/your-username/led-banner-app.git
cd led-banner-app
```

2. 의존성 설치

```bash
npm install
```

3. 앱 실행

```bash
npm start
```

## 프로젝트 구조

```
side-led-banner-app/
├── app/
│   ├── _layout.tsx              # 루트 레이아웃 (테마, 네비게이션)
│   ├── index.tsx                # 메인 화면 (배너 편집기)
│   ├── settings.tsx             # 앱 설정 화면
│   ├── sunnyList.tsx            # Sunny 앱/게임 목록 화면
│   └── openSourceInfo.tsx       # 오픈소스 정보 화면
├── components/
│   ├── settings/
│   │   ├── backgroundSection.tsx     # 배경 설정 UI
│   │   ├── backgroundPhotoSheet.tsx  # 배경 사진 설정 시트
│   │   ├── effectSection.tsx         # 이펙트 설정 UI
│   │   ├── PixelColorMixButton.tsx   # Pixel 색상 혼합 버튼
│   │   ├── textSection.tsx           # 텍스트 설정 UI
│   │   └── settingsSliderBlock.tsx   # 설정용 슬라이더 블록
│   ├── animation/
│   │   ├── BackgroundEffectLayer.tsx # 배경 이펙트 레이어
│   │   ├── HeartBackgroundTicker.tsx # 하트 배경 티커
│   │   ├── MarqueeCanvas.tsx         # Skia 마퀴 캔버스
│   │   └── buildCanvas.ts            # 캔버스 props 조합 유틸
│   ├── dev/
│   │   ├── rewardAdDebugFab.tsx      # 리워드 광고 디버그 버튼
│   │   └── sheetFetchDebugPanel.tsx  # 시트 fetch 디버그 패널
│   ├── skia/
│   │   └── GradientBackdrop.tsx      # 그라데이션 배경
│   ├── previewPanel.tsx              # 미리보기 패널
│   ├── ledBannerFullScreen.tsx       # 전체화면 LED 배너 모달
│   ├── rewardAdModal.tsx             # 리워드 광고 모달
│   ├── colorPicker.tsx               # 색상 선택 컴포넌트
│   └── slider.tsx                    # 슬라이더 컴포넌트
├── hooks/
│   ├── useMarqueeAnimation.ts      # 마키 스크롤 애니메이션 로직
│   ├── useBlinkOpacityStyle.ts     # 깜빡임(불투명도) 스타일 훅
│   ├── useBackgroundAnimation.ts   # 배경 이펙트 애니메이션 훅
│   ├── useGoogleSheets.ts          # Google Sheet 로드 훅
│   ├── usePreviewPanelCanvas.ts    # 미리보기 캔버스 훅
│   ├── useSkiaAppearanceFont.ts    # Skia 폰트 훅
│   ├── useSpeechBubble.ts          # 말풍선 레이아웃 훅
│   ├── useTextInput.ts             # 입력창 상태 훅
│   ├── useTextMetrics.ts           # 텍스트 크기 계산 훅
│   ├── useTilePicture.ts           # 타일 picture 생성 훅
│   ├── use-color-scheme.ts         # 다크/라이트 모드 감지
│   └── use-color-scheme.web.ts     # 웹용 컬러 스킴
├── constants/
│   ├── styles.tsx                   # 공통 스타일
│   ├── btnStyles.tsx                # 버튼 스타일
│   ├── colorPalette.tsx             # 텍스트/배경 색상 팔레트
│   ├── appFonts.ts                  # 앱 폰트 정의
│   ├── gradientBackgroundPresets.ts # 그라데이션 배경 프리셋
│   ├── language.ts                  # 앱 언어 타입
│   ├── settingsStyles.tsx           # 설정 화면 스타일
│   ├── speechBubblePresets.ts       # 말풍선 프리셋
│   └── sunnyApps.ts                 # Sunny 앱 목록
├── contexts/
│   └── settingsContext.tsx          # 설정 값 컨텍스트
├── language/
│   ├── deviceLocale.ts              # 기기 로케일 변환
│   ├── effectSectionLabels.ts       # 효과 섹션 다국어 라벨
│   ├── matchSheetRows.ts            # 시트 라벨 매칭 유틸
│   ├── rewardAdLabels.ts            # 리워드 광고 라벨
│   ├── textSectionLabels.ts         # 텍스트 섹션 다국어 라벨
│   └── translatorHandoff.ts         # 번역 핸드오프 메모
├── utils/
│   ├── buildMarqueeTextBlob.ts      # Skia 텍스트 blob 생성
│   ├── glyphLedPanels.ts            # Pixel LED 패널 계산
│   ├── pixelColorMix.ts             # Pixel 색상 혼합 유틸
│   ├── presetStorage.ts             # 프리셋 저장 유틸
│   ├── recordTile.ts                # 마퀴 타일 기록 유틸
│   ├── skiaBubbleTextLayout.ts      # 말풍선 텍스트 레이아웃
│   ├── textSizing.ts                # 텍스트 크기 계산 유틸
│   └── viewMode.ts                  # 보기 모드 유틸
├── assets/
│   ├── fonts/
│   ├── images/
│   └── svg/
│       ├── deleteAllButton.tsx    # 입력 초기화 버튼 SVG
│       ├── playOptionButton.tsx   # 한줄/여러줄 재생 버튼 SVG
│       ├── playResumeButton.tsx   # 재생/정지 버튼 SVG
│       └── sliderButtons.tsx      # 슬라이더 버튼 SVG
├── scripts/
│   └── reset-project.js           # 프로젝트 초기화 스크립트
├── app.json                       # Expo 앱 설정
├── eas.json                       # EAS 빌드/배포 설정
├── package-lock.json
├── package.json
├── tsconfig.json                  # TypeScript 설정
└── eslint.config.js               # ESLint 설정
```

## 주요 라이브러리

| 라이브러리                                                                                      | 버전     | 용도                            |
| ----------------------------------------------------------------------------------------------- | -------- | ------------------------------- |
| [Expo](https://expo.dev/)                                                                       | ~54.0.31 | React Native 개발 프레임워크    |
| [expo-router](https://docs.expo.dev/router/introduction/)                                       | ~6.0.21  | 파일 기반 라우팅                |
| [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)                  | ~4.1.1   | 마키 스크롤 애니메이션          |
| [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)        | ~2.28.0  | 터치/제스처 처리                |
| [expo-screen-orientation](https://docs.expo.dev/versions/latest/sdk/screen-orientation/)        | ~9.0.8   | 전체화면 시 가로/세로 전환 제어 |
| [expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)              | ~15.0.8  | 프리셋 버튼 그라디언트          |
| [@react-native-community/slider](https://github.com/callstack/react-native-slider)              | ^5.1.2   | 속도/크기/블러 등 슬라이더 UI   |
| [react-native-element-dropdown](https://github.com/hoaphantn7604/react-native-element-dropdown) | ^2.12.4  | 폰트 선택 드롭다운              |
| [react-native-svg](https://github.com/software-mansion/react-native-svg)                        | 15.12.1  | SVG 아이콘 (재생/정지 버튼 등)  |
| [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)   | ~5.6.0   | 노치/Safe Area 대응             |
| [@react-navigation/native](https://reactnavigation.org/)                                        | ^7.1.8   | 네비게이션 & 테마 관리          |

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).
