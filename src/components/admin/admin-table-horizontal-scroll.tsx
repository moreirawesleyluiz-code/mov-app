"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Barra horizontal no topo (sticky), sincronizada com o scroll do conteúdo abaixo.
 * Só aparece quando há overflow horizontal real.
 */
export function AdminTableHorizontalScroll({ children, className = "" }: Props) {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showTopBar, setShowTopBar] = useState(false);
  const [spacerWidth, setSpacerWidth] = useState(0);

  const updateMetrics = useCallback(() => {
    const bottom = bottomRef.current;
    if (!bottom) return;
    const sw = bottom.scrollWidth;
    const cw = bottom.clientWidth;
    setShowTopBar(sw > cw + 1);
    setSpacerWidth(sw);
  }, []);

  useLayoutEffect(() => {
    updateMetrics();
    const bottom = bottomRef.current;
    if (!bottom) return;
    const ro = new ResizeObserver(() => updateMetrics());
    ro.observe(bottom);
    window.addEventListener("resize", updateMetrics);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, [updateMetrics, children]);

  useLayoutEffect(() => {
    const t = topRef.current;
    const b = bottomRef.current;
    if (!showTopBar || !t || !b) return;
    t.scrollLeft = b.scrollLeft;
  }, [showTopBar, spacerWidth]);

  const onTopScroll = () => {
    const t = topRef.current;
    const b = bottomRef.current;
    if (!t || !b) return;
    if (Math.abs(b.scrollLeft - t.scrollLeft) > 0.5) b.scrollLeft = t.scrollLeft;
  };

  const onBottomScroll = () => {
    const t = topRef.current;
    const b = bottomRef.current;
    if (!t || !b) return;
    if (Math.abs(t.scrollLeft - b.scrollLeft) > 0.5) t.scrollLeft = b.scrollLeft;
  };

  return (
    <div className={`relative ${className}`}>
      {showTopBar && spacerWidth > 0 && (
        <div
          ref={topRef}
          onScroll={onTopScroll}
          className="sticky top-0 z-20 overflow-x-auto overflow-y-hidden border-b border-movApp-border bg-movApp-bg py-1 shadow-sm [scrollbar-width:thin] [color-scheme:light]"
          role="presentation"
          aria-hidden
        >
          <div className="h-3 shrink-0" style={{ width: spacerWidth }} />
        </div>
      )}
      <div
        ref={bottomRef}
        onScroll={onBottomScroll}
        className="overflow-x-auto [scrollbar-width:thin]"
      >
        {children}
      </div>
    </div>
  );
}
