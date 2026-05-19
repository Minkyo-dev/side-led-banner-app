import type { AppLocaleKey } from "@/constants/language";

/**
 * ## UI 문자열·번역팀·스프레드시트 연동 (개발자용)
 *
 * 1. **화면에 새 문구가 필요하면** 컴포넌트에 한글/영어를 바로 박지 말고, 아래
 *    `STRING_BACKLOG_FOR_TRANSLATORS`에 **한 줄 객체**를 추가합니다.
 *    - `sheetRowKey`: Google 시트 **A열**에 넣을 고정 ID (예: `text.letterSpacing`).
 *      팀에서 규칙만 맞추면 됩니다. (`text.*`, `effect.*`, `common.*` 등)
 *    - `notesForTranslators`: 번역팀/기획이 맥락을 이해할 수 있게 **한국어 또는 영어**로
 *      화면 위치·뜻·최대 글자 수 등을 적습니다.
 *    - `draftKo` / `draftEn`: 임시 표기(시트가 비어 있을 때 앱에서 쓸 fallback으로
 *      옮길 수 있는 초안). 번역 확정 후에는 시트 B~F가 정본이 될 수 있습니다.
 *
 * 2. **번역팀**은 시트에 `sheetRowKey`와 동일한 A열 값으로 행을 추가하고 B~F에
 *    한·영·일·번체·간체를 채웁니다. (현재 앱의 B~F 열 순서와 동일)
 *
 * 3. **시트를 앱에 연결할 때**는 `useGoogleSheets`의 `rows`와 `pickLocaleFromSheetRows` /
 *    `tTextSectionLabel` 등 기존 패턴으로 시트 우선·코드 fallback을 적용하면 됩니다.
 *
 * 4. **시트에 반영이 끝난 항목**은 백로그에서 지우고, 필요하면 `language/textSectionLabels.ts`
 *    등 코드 내 fallback 테이블을 시트와 동기화합니다.
 *
 * 5. **스프레드시트만 고치고 코드는 안 건드리는** 단계로 가려면, 모든 문구를
 *    `sheetRowKey` 기준으로 런타임 로딩하고 코드 테이블은 fallback만 두면 됩니다.
 */

export type TranslationSourceRow = {
  /** 시트 A열과 1:1로 맞출 ID (고유) */
  readonly sheetRowKey: string;
  /** 어느 화면/파일인지 (예: `TEXT` 탭 슬라이더) */
  readonly componentHint: string;
  /** 번역팀용 설명 — 한국어·영어 모두 허용 */
  readonly notesForTranslators: string;
  /** 임시 한국어(시트 전·fallback용) */
  readonly draftKo: string;
  /** 임시 영어(시트 전·fallback용) */
  readonly draftEn: string;
};

/**
 * 시트에 아직 없는·검수 중인 문구만 적습니다.
 * 시트에 키가 생기고 앱에서 읽기로 확정되면 여기서 제거합니다.
 */
export const STRING_BACKLOG_FOR_TRANSLATORS: TranslationSourceRow[] = [
  // 리워드 팝업(32~38행)은 시트·language/rewardAdLabels.ts에 반영됨.
  // 시트 점검: 32·37·38행 E/F(번체·간체) 열이 뒤바뀐 상태, 33행 E열 오타("可 walls…") — 수정 후 앱이 자동 반영.
  // 예시 (실제로는 시트 반영 후 삭제하거나, 새 문자열 추가 시만 작성)
  // {
  //   sheetRowKey: "text.exampleNewLabel",
  //   componentHint: "TEXT 탭 · 예정된 옵션",
  //   notesForTranslators:
  //     "LED 미리보기 아래 토글 한 줄 설명. 짧게(20자 이내) 부탁드립니다.",
  //   draftKo: "예시(임시)",
  //   draftEn: "Example (temp)",
  // },
];

/**
 * 백로그를 탭으로 구분한 한 줄씩 반환합니다.
 * 번역팀은 1열을 시트 A열(행 키)과 동일하게 두고, 2·3열을 B·C 초안으로 옮긴 뒤
 * D~F(일·번체·간체)를 시트에서 채우면 됩니다.
 */
export function backlogToTsvForTranslators(
  rows: readonly TranslationSourceRow[],
): string {
  const esc = (s: string) => s.replace(/\t/g, " ").replace(/\r?\n/g, " ");
  const lines = rows.map(
    (r) =>
      `${esc(r.sheetRowKey)}\t${esc(r.draftKo)}\t${esc(r.draftEn)}`,
  );
  return ["sheetRowKey\tdraftKo\tdraftEn", ...lines].join("\n");
}

/** `resolvedAppLocale`이 한국어/영어일 때 백로그에서 임시 문구만 꺼내 쓸 때 */
export function pickDraftFromBacklog(
  sheetRowKey: string,
  locale: AppLocaleKey,
  rows: readonly TranslationSourceRow[] = STRING_BACKLOG_FOR_TRANSLATORS,
): string | null {
  const row = rows.find((r) => r.sheetRowKey === sheetRowKey);
  if (!row) return null;
  if (locale === "ko") return row.draftKo;
  if (locale === "en") return row.draftEn;
  return row.draftEn;
}
