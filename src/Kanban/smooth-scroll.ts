import React, { MutableRefObject } from "react";

type ScrollDirection = "top" | "bottom" | "left" | "right";
export type SwimlaneRef = MutableRefObject<HTMLDivElement | undefined>;

export const scrollController = (swimlanesRef: SwimlaneRef) => {
  let timerId = new Map();
  let intersectingRatio = 0.01;
  let debounceStopTimerId = 0;
  const control = {
    smoothScrollBy: (dir: ScrollDirection) => {
      if (timerId.get(dir)) return;
      timerId.set(
        dir,
        setInterval(() => {
          requestAnimationFrame(() => {
            if (dir === "top") {
              swimlanesRef.current?.scrollBy(0, -1 * (intersectingRatio * 100));
            }
            if (dir === "bottom") {
              swimlanesRef.current?.scrollBy(0, 1 * (intersectingRatio * 100));
            }
            if (dir === "left") {
              swimlanesRef.current?.scrollBy(-1 * (intersectingRatio * 10), 0);
            }
            if (dir === "right") {
              swimlanesRef.current?.scrollBy(intersectingRatio * 10, 0);
            }
          });
        }, 10)
      );
    },
    debounceStop: () => {
      debounceStopTimerId = window.setTimeout(() => {
        control.stopAll();
      }, 100);
    },
    start: (dir: ScrollDirection) => {
      control.smoothScrollBy(dir);
      clearTimeout(debounceStopTimerId);
      control.debounceStop();
    },
    stop: (dir: ScrollDirection) => {
      clearInterval(timerId.get(dir));
      timerId.delete(dir);
    },
    setIntersectingRatio: (ratio: number) => {
      intersectingRatio = ratio;
    },
    stopAll: () => {
      timerId.forEach((_, dir) => {
        control.stop(dir);
      });
      timerId.clear();
    },
  };
  return control;
};
