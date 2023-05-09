import React, {
  CSSProperties,
  MutableRefObject,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { debounce } from "./util";

interface Props {
  numItems: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: CSSProperties }) => JSX.Element;
  parentHeight: number;
  debounceTimer?: number;
  onScroll?: (start: number, end: number) => void;
  swimlanesRef?: MutableRefObject<any>;
  onMount?: (start: number, end: number) => void;
  name: string;
}

export const VirtualizedList = forwardRef<HTMLDivElement, Props>(
  (props, ref) => {
    const {
      numItems,
      itemHeight,
      renderItem,
      parentHeight,
      debounceTimer = 200,
      onScroll: onPropScroll,
      swimlanesRef,
    } = props;
    const [scrollTop, setScrollTop] = useState(0);
    const innerHeight = numItems * itemHeight;
    const startIndex = Math.max(Math.floor(scrollTop / itemHeight) - 2, 0);
    const endIndex = Math.min(
      numItems - 1,
      Math.floor((scrollTop + parentHeight) / itemHeight) + 2
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
          console.log("pushing to parent scroll");
          onPropScroll?.(start, end);
        }, debounceTimer),
      [debounceTimer, onPropScroll]
    );

    useLayoutEffect(() => {
      // we need to send to parent how many items should it fetch from background
      // we duplicated start and end because its not inside useState so the latest values won't get picked up
      const start = Math.max(Math.floor(scrollTop / itemHeight) - 2, 0);
      const end = Math.min(
        numItems - 1,
        Math.floor((scrollTop + parentHeight) / itemHeight) + 2
      );
      props.onMount?.(start, end);
      // we aren't bothered about dynamic itemHeight on initial mount so we can ignore it in deps
    }, [numItems]);

    return (
      <div
        className='scroll'
        style={{ overflowY: "auto", height: `${parentHeight}px` }}
        onScroll={(e) => {
          e.stopPropagation();
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
