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
│ ├── layout.tsx # 루트 레이아웃 (테마, 네비게이션)
│ └── index.tsx # 메인 화면 (배너 편집기)
├── components/
│ ├── ledBannerFullScreen.tsx # 전체화면 LED 배너 모달
│ ├── colorPicker.tsx # 색상 선택 컴포넌트
│ └── slider.tsx # 슬라이더 컴포넌트
├── hooks/
│ ├── useMarqueeAnimation.ts # 마키 스크롤 애니메이션 로직
│ ├── use-color-scheme.ts # 다크/라이트 모드 감지
│ ├── use-color-scheme.web.ts # 웹용 컬러 스킴
│ └── use-theme-color.ts # 테마 색상 유틸
├── constants/
│ ├── styles.tsx # 공통 스타일
│ ├── btnStyles.tsx # 버튼 스타일
│ ├── colorPalette.tsx # 텍스트/배경 색상 팔레트
│ └── theme.ts # 테마 정의
├── assets/
│ └── svg/
│ ├── playOptionButton.tsx # 한줄/여러줄 재생 버튼 SVG
│ ├── playResumeButton.tsx # 재생/정지 버튼 SVG
│ └── sliderThumbButton.tsx # 슬라이더 썸 SVG
├── scripts/
│ └── reset-project.js # 프로젝트 초기화 스크립트
├── app.json # Expo 앱 설정
├── eas.json # EAS 빌드/배포 설정
├── package.json
├── tsconfig.json
└── eslint.config.js
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
