import type { AppLocaleKey } from "@/constants/language";
import type { GoogleSheetLocaleRow } from "@/hooks/useGoogleSheets";

export type SheetRowPickOptions = {
  /**
   * 게시된 시트의 **행 번호(1-based, 헤더 포함)**.
   * 해당 행의 현재 locale 칸이 비어 있지 않으면 그 값만 씀.
   * `strictSheetRow`가 아니면: 행이 없거나 칸이 비었을 때 아래 영어·한글 앵커 매칭으로 이어짐.
   * `strictSheetRow`이면: 그 행에서 값을 못 쓰면 `null`만 반환(앱 기본 라벨로 fallback).
   */
  sheetRow?: number;
  /** `sheetRow`와 함께 쓸 때, 행 없음·해당 locale 빈 칸이면 앵커 매칭 생략 */
  strictSheetRow?: boolean;
  /**
   * 영어(C)열이 같은 문자열인 행이 여러 개일 때 몇 번째(0부터).
   * 생략이면 **마지막** 행(아래쪽).
   */
  englishOccurrenceIndex?: number;
  /**
   * 한글(B)열 기준 몇 번째(0부터). 생략이면 **마지막** 행.
   */
  koreanOccurrenceIndex?: number;
};

function normEn(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * 시트 한 줄(B~F = ko…zhSC)에서 문자열을 고릅니다.
 * 1) `sheetRow`가 있으면 그 행을 찾았을 때: 해당 locale 칸이 **비어 있지 않으면** 그걸 쓰고 끝.
 *    `strictSheetRow`면 행 없음·빈 칸 → `null`. 아니면 아래 영어/한글 매칭으로 넘어감.
 * 2) 영어(C)가 코드 기본 영어와 같으면 그 행들 중 occurrence 규칙으로 선택
 *    (occurrence 미지정이면, 동일 영어가 여러 줄일 때 **현재 locale 열이 비어 있지 않은 행만** 모아 그중 마지막)
 * 3) 없으면 한글(B)로 동일
 */
export function pickLocaleFromSheetRows(
  rows: GoogleSheetLocaleRow[] | null | undefined,
  locale: AppLocaleKey,
  fallbackEn: string,
  fallbackKo: string,
  options?: SheetRowPickOptions,
): string | null {
  if (!rows?.length) return null;

  if (options?.sheetRow !== undefined) {
    const hit = rows.find((r) => r.sheetRow === options.sheetRow);
    if (hit) {
      const cell = hit.locales[locale]?.trim();
      if (cell) return cell;
      if (options.strictSheetRow) return null;
    } else if (options.strictSheetRow) {
      return null;
    }
  }

  const enNeedle = normEn(fallbackEn);
  const enMatches: GoogleSheetLocaleRow[] = [];
  for (const r of rows) {
    if (normEn(r.locales.en ?? "") === enNeedle) {
      enMatches.push(r);
    }
  }

  let picked: GoogleSheetLocaleRow | undefined;

  if (enMatches.length > 0) {
    if (options?.englishOccurrenceIndex !== undefined) {
      const idx = Math.min(
        options.englishOccurrenceIndex,
        enMatches.length - 1,
      );
      picked = enMatches[idx];
    } else {
      /** 같은 C열 영어가 여러 줄일 때: 요청 locale 칸이 채워진 행만 두고 그중 마지막(아래). 전부 비면 예전처럼 전체 중 마지막. */
      const nonEmptyForLocale = enMatches.filter(
        (r) => (r.locales[locale] ?? "").trim() !== "",
      );
      const pool =
        nonEmptyForLocale.length > 0 ? nonEmptyForLocale : enMatches;
      picked = pool[pool.length - 1];
    }
  }

  if (!picked) {
    const koNeedle = fallbackKo.trim();
    const koMatches: GoogleSheetLocaleRow[] = [];
    for (const r of rows) {
      if ((r.locales.ko ?? "").trim() === koNeedle) {
        koMatches.push(r);
      }
    }
    if (koMatches.length > 0) {
      const idx =
        options?.koreanOccurrenceIndex !== undefined
          ? Math.min(options.koreanOccurrenceIndex, koMatches.length - 1)
          : koMatches.length - 1;
      picked = koMatches[idx];
    }
  }

  if (!picked) return null;
  const cell = picked.locales[locale]?.trim();
  return cell ? cell : null;
}
