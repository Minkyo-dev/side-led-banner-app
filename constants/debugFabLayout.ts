const FAB_HEIGHT = 36;
const FAB_GAP = 8;

function fabBottom(indexFromBottom: number): number {
  const bannerClearance = 120;
  return bannerClearance + indexFromBottom * (FAB_HEIGHT + FAB_GAP);
}

export const DEBUG_FAB_BOTTOM = {
  csv: fabBottom(0),
  pro: fabBottom(1),
  ads: fabBottom(2),
} as const;
