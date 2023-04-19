import React, {
  CSSProperties,
  MutableRefObject,
  forwardRef,
  useMemo,
  useState,
} from "react";
import { debounce } from "./util";

interface Props {
  numItems: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: CSSProperties }) => JSX.Element;
  windowHeight: number;
  debounceTimer?: number;
  onScroll?: (start: number, end: number) => void;
  swimlanesRef?: MutableRefObject<any>;
}

export const VirtualizedList = forwardRef<HTMLDivElement, Props>(
  (props, ref) => {
    const {
      numItems,
      itemHeight,
      renderItem,
      windowHeight,
      debounceTimer = 200,
      onScroll: onPropScroll,
      swimlanesRef,
    } = props;
    const [scrollTop, setScrollTop] = useState(0);
    const innerHeight = numItems * itemHeight;
    const startIndex = Math.max(Math.floor(scrollTop / itemHeight) - 2, 0);
    const endIndex = Math.min(
      numItems - 1,
      Math.floor((scrollTop + windowHeight) / itemHeight) + 2
    );

    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push(
        renderItem({
          index: i,
          style: {
            position: "absolute",
            top: `${i * itemHeight}px`,
            width: "100%",
          },
        })
      );
    }

    const propOnScroll = useMemo(
      () =>
        debounce((start, end) => {
          onPropScroll?.(start, end);
        }, debounceTimer),
      [debounceTimer, onPropScroll]
    );

    return (
      <div
        className='scroll'
        style={{ overflowY: "auto", height: `${windowHeight}px` }}
        onScroll={(e) => {
          setScrollTop(e.currentTarget.scrollTop);
          propOnScroll(startIndex, endIndex);
        }}
        id='scroll'
        ref={swimlanesRef}
        onDragEnd={(e) => {
          console.log("edning drag");
        }}
        onDragEndCapture={(e) => {
          console.log("edning drag capture");
        }}
        onDrop={(e) => {
          e.preventDefault();
          console.log("drop");
        }}
      >
        <div
          className='inner'
          style={{ position: "relative", height: `${innerHeight}px` }}
          ref={ref}
          onDragEnd={(e) => {
            console.log("edning drag");
          }}
          onDragEndCapture={(e) => {
            console.log("edning drag capture");
          }}
          onDrop={(e) => {
            e.preventDefault();
            console.log("drop");
          }}
        >
          {items}
        </div>
      </div>
    );
  }
);
