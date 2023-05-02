import {
  MutableRefObject,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  KanbanContextParams,
  kanbanReducer,
  stateKanbanActions,
  useInit,
} from "./KanbanContext";
import { SwimlaneRef, scrollController } from "./smooth-scroll";
import {
  DropParams,
  Id,
  KanbanBoardState,
  LayoutFetch,
  PurgeAction,
  Task,
} from "./type";

const useScroller = (swimlanesRef: SwimlaneRef) => {
  return useMemo(() => scrollController(swimlanesRef), [swimlanesRef]);
};

const scrollElement = (
  scrollElementController: ReturnType<typeof useScroller>,
  event: any,
  scrollableElement: HTMLElement | undefined
) => {
  const offset = 300;
  // Calculate the distance that the mouse has moved since the mousedown event
  const height = scrollableElement
    ? scrollableElement.clientHeight
    : window.screen.availHeight;
  const width = scrollableElement
    ? scrollableElement.clientWidth
    : document.documentElement.clientWidth;
  const mouseY = event.clientY;
  const mouseX = event.clientX;

  const bottomRatio = 1 - (height - mouseY) / offset;
  const topRatio = 1 - mouseY / offset;
  const leftRatio = 1 - mouseX / offset;
  const rightRatio = 1 - (width - mouseX) / offset;
  if (bottomRatio < 0 && topRatio < 0) {
    scrollElementController.stop("top");
    scrollElementController.stop("bottom");
  }
  if (leftRatio < 0 && rightRatio < 0) {
    scrollElementController.stop("left");
    scrollElementController.stop("right");
  }
  if (leftRatio > 0) {
    scrollElementController.setIntersectingRatio(leftRatio);
    scrollElementController.start("left");
  }
  if (rightRatio > 0) {
    scrollElementController.setIntersectingRatio(rightRatio);
    scrollElementController.start("right");
  }
  if (bottomRatio > 0) {
    scrollElementController.setIntersectingRatio(bottomRatio);
    scrollElementController.start("bottom");
  }
  if (topRatio > 0) {
    scrollElementController.setIntersectingRatio(topRatio);
    scrollElementController.start("top");
  }
};

const useDrag = <T extends { id: Id }>(
  swimlanesRef: MutableRefObject<HTMLDivElement | undefined>
): { drag: T | null; setDrag: (task: T | null) => void } => {
  const [drag, _setDrag] = useState<T | null>(null);
  const scroller = useScroller(swimlanesRef);
  const setDrag = useCallback(
    (task: T | null) => {
      const scrollableElement = swimlanesRef.current;
      const initScrollElement = (event: any) => {
        scrollElement(scroller, event, scrollableElement);
      };

      const initListener = () => {
        document.addEventListener("dragover", initScrollElement);
      };
      const removeListener = () => {
        document.removeEventListener("dragover", initScrollElement);
        scroller.stopAll();
      };

      if (swimlanesRef && task) {
        _setDrag(task);
        initListener();
      } else {
        _setDrag(null);
        removeListener();
      }
    },
    [scroller, swimlanesRef]
  );
  return { drag, setDrag };
};

export interface UseKanbanStateParam {
  isDropAllowed: (params: DropParams) => boolean | Promise<boolean>;
  layoutFetch: LayoutFetch;
  onDropSuccess?: (params: DropParams) => void;
  onDropFailed?: (params: DropParams) => void;
}

declare global {
  interface Window {
    kanbanState: KanbanBoardState;
  }
}

const safePromiseBoolean = async (promise: Promise<boolean>) => {
  try {
    const result = await promise;
    return result;
  } catch (e) {
    return false;
  }
};

export const useKanbanState = <TaskDetails extends { id: Id }>({
  isDropAllowed,
  onDropSuccess,
  onDropFailed,
  layoutFetch,
}: UseKanbanStateParam): {
  kanbanState: KanbanBoardState;
  kanbanActions: KanbanContextParams["kanbanActions"];
  drag: Task<TaskDetails> | null;
  setDrag: (task: Task<TaskDetails> | null) => void;
  swimlanesRef: MutableRefObject<HTMLDivElement | undefined>;
} => {
  const [kanbanState, dispatch] = useReducer(kanbanReducer, {});
  const swimlanesRef = useRef<HTMLDivElement>();
  const { drag, setDrag } = useDrag<Task<TaskDetails>>(swimlanesRef);

  useInit(dispatch, layoutFetch, stateKanbanActions);

  const kanbanActions = useMemo((): KanbanContextParams["kanbanActions"] => {
    return {
      handleDrop: async ({ from, task, to }: DropParams) => {
        const isAllowedPromise = isDropAllowed({ task, from, to });
        dispatch(
          stateKanbanActions.handleDrop({
            from,
            task: structuredClone(task),
            to,
          })
        );
        const isAllowed =
          typeof isAllowedPromise === "boolean"
            ? isAllowedPromise
            : await safePromiseBoolean(isAllowedPromise);
        if (!isAllowed) {
          const params = {
            from: to,
            task: structuredClone(task),
            to: from,
          };
          dispatch(stateKanbanActions.handleDrop(params));
          onDropFailed?.(params);
        } else {
          onDropSuccess?.({ from, task, to });
        }
      },
      purgeData: (params: PurgeAction) => {
        dispatch(stateKanbanActions.purgeData(params));
      },
      updateSwimlaneTask: (params: KanbanBoardState) => {
        dispatch(stateKanbanActions.updateSwimlaneTask(params));
      },
    };
  }, [isDropAllowed, onDropFailed, onDropSuccess]);
  return {
    kanbanState,
    kanbanActions,
    drag,
    setDrag,
    swimlanesRef,
  };
};
