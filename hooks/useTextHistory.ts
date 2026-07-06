import { useCallback, useRef, useState } from "react";

export type TextSnapshot = { text: string; sel: { start: number; end: number } };

const DEBOUNCE_MS = 400;
const MAX_STACK = 50;

export function useTextHistory(initialText: string) {
  const undoStackRef = useRef<TextSnapshot[]>([
    { text: initialText, sel: { start: 0, end: 0 } },
  ]);
  const redoStackRef = useRef<TextSnapshot[]>([]);
  const liveRef = useRef<TextSnapshot>({ text: initialText, sel: { start: 0, end: 0 } });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = useCallback(() => {
    const top = undoStackRef.current[undoStackRef.current.length - 1];
    const live = liveRef.current;
    setCanUndo(undoStackRef.current.length > 1 || (top != null && top.text !== live.text));
    setCanRedo(redoStackRef.current.length > 0);
  }, []);

  const onTextChange = useCallback(
    (text: string, sel: { start: number; end: number }) => {
      const top = undoStackRef.current[undoStackRef.current.length - 1];

      if (top && top.text === liveRef.current.text && top.text !== text) {
        undoStackRef.current[undoStackRef.current.length - 1] = { text: top.text, sel };
      }

      liveRef.current = { text, sel };

      if (top?.text !== text) setCanUndo(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const currentTop = undoStackRef.current[undoStackRef.current.length - 1];
        const live = liveRef.current;
        if (currentTop?.text === live.text) return;

        const next = [...undoStackRef.current, live];
        undoStackRef.current = next.length > MAX_STACK ? next.slice(-MAX_STACK) : next;
        redoStackRef.current = [];
        syncFlags();
      }, DEBOUNCE_MS);
    },
    [syncFlags],
  );

  // 즉시 스냅샷 확정 (전체삭제 버튼 등에서 사용)
  const commitSnapshot = useCallback(
    (text: string, sel: { start: number; end: number }) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const top = undoStackRef.current[undoStackRef.current.length - 1];
      if (top?.text === text) return;

      const next = [...undoStackRef.current, { text, sel }];
      undoStackRef.current = next.length > MAX_STACK ? next.slice(-MAX_STACK) : next;
      redoStackRef.current = [];
      syncFlags();
    },
    [syncFlags],
  );

  const undo = useCallback((): TextSnapshot | null => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const stack = undoStackRef.current;
    const live = liveRef.current;
    const top = stack[stack.length - 1];

    // 마지막 스냅샷으로 되돌리기
    if (top && top.text !== live.text) {
      redoStackRef.current = [...redoStackRef.current, live];
      liveRef.current = top;
      syncFlags();
      return top;
    }

    if (stack.length <= 1) return null;

    const current = stack[stack.length - 1];
    undoStackRef.current = stack.slice(0, -1);
    redoStackRef.current = [...redoStackRef.current, current];
    const prev = undoStackRef.current[undoStackRef.current.length - 1];
    liveRef.current = prev;
    syncFlags();
    return prev;
  }, [syncFlags]);

  const redo = useCallback((): TextSnapshot | null => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const redoStack = redoStackRef.current;
    if (redoStack.length === 0) return null;

    const live = liveRef.current;
    const top = undoStackRef.current[undoStackRef.current.length - 1];

    if (!top || top.text !== live.text) {
      const next = [...undoStackRef.current, live];
      undoStackRef.current = next.length > MAX_STACK ? next.slice(-MAX_STACK) : next;
    }

    const nextSnapshot = redoStack[redoStack.length - 1];
    redoStackRef.current = redoStack.slice(0, -1);
    undoStackRef.current = [...undoStackRef.current, nextSnapshot];
    liveRef.current = nextSnapshot;
    syncFlags();
    return nextSnapshot;
  }, [syncFlags]);

  const resetHistory = useCallback((text: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    undoStackRef.current = [{ text, sel: { start: text.length, end: text.length } }];
    redoStackRef.current = [];
    liveRef.current = { text, sel: { start: text.length, end: text.length } };
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  return { onTextChange, commitSnapshot, undo, redo, canUndo, canRedo, resetHistory };
}
