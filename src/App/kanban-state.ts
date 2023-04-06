import {
  ActionReducerMapBuilder,
  AnyAction,
  PayloadAction,
  createSlice,
} from "@reduxjs/toolkit";
import {
  Dispatch,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { SwimlaneRef, scrollController } from "./smooth-scroll";
import { DropParams, Id, KanbanActions, KanbanBoardState, Task } from "./type";

const useScroller = (swimlanesRef: SwimlaneRef) => {
  return useMemo(() => scrollController(swimlanesRef), [swimlanesRef]);
};

const scrollElement = (
  scrollElementController: ReturnType<typeof useScroller>,
  event: any
) => {
  const offset = 300;
  // Calculate the distance that the mouse has moved since the mousedown event
  const height = window.screen.availHeight;
  const width = document.documentElement.clientWidth;
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
      const initScrollElement = (event: any) => {
        scrollElement(scroller, event);
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

const handleDrop = (
  state: KanbanBoardState,
  action: PayloadAction<DropParams>
) => {
  const { from, to, task } = action.payload;
  state[from.swimlaneId].cols[from.colId].tasks = state[from.swimlaneId].cols[
    from.colId
  ].tasks.filter((t) => t.id !== task.id);
  state[from.swimlaneId].cols[from.colId].count -= 1;
  state[to.swimlaneId].cols[to.colId].count += 1;
  state[to.swimlaneId].cols[to.colId].tasks.unshift({
    ...task,
    colId: to.colId,
    swimlaneId: to.swimlaneId,
  });
  const acrossSwimlanes = from.swimlaneId !== to.swimlaneId;
  if (acrossSwimlanes) {
    state[from.swimlaneId].count -= 1;
    state[to.swimlaneId].count += 1;
  }
  return state;
};

const init = (
  state: KanbanBoardState,
  actions: PayloadAction<KanbanBoardState>
) => {
  state = actions.payload;
  return state;
};

const kanbanSlice = (
  extraReducers?: (builder: ActionReducerMapBuilder<KanbanBoardState>) => void
) =>
  createSlice({
    initialState: {},
    name: "kanban-board-slice",
    reducers: {
      handleDrop,
      init,
    },
    extraReducers,
  });

const useInit = (
  dispatch: Dispatch<AnyAction>,
  fetchData: () => Promise<KanbanBoardState>,
  actions: ReturnType<typeof kanbanSlice>["actions"]
) => {
  useEffect(() => {
    fetchData().then((state) => {
      dispatch(actions.init(state));
    });
  }, [actions, dispatch, fetchData]);
};

export interface UseKanbanStateParam {
  isDropAllowed: (params: DropParams) => boolean | Promise<boolean>;
  fetchData: () => Promise<KanbanBoardState>;
  onDropSuccess?: (params: DropParams) => void;
  onDropFailed?: (params: DropParams) => void;
  extraReducers?: (builder?: ActionReducerMapBuilder<KanbanBoardState>) => void;
}

declare global {
  interface Window {
    kanbanState: KanbanBoardState;
  }
}

const safePromiseBoolean = async (promise: Promise<boolean>) => {
  try {
    const result = await promise;
    console.log(result);
    return result;
  } catch (e) {
    return false;
  }
};

export const useKanbanState = ({
  isDropAllowed,
  onDropSuccess,
  onDropFailed,
  extraReducers,
  fetchData,
}: UseKanbanStateParam): {
  kanbanState: KanbanBoardState;
  kanbanActions: KanbanActions;
  drag: Task | null;
  setDrag: (task: Task | null) => void;
  swimlanesRef: MutableRefObject<HTMLDivElement | undefined>;
} => {
  const slice = useMemo(() => kanbanSlice(extraReducers), [extraReducers]);
  const [kanbanState, dispatch] = useReducer(slice.reducer, {});
  window.kanbanState = kanbanState;
  const actions = slice.actions;
  const swimlanesRef = useRef<HTMLDivElement>();
  const { drag, setDrag } = useDrag<Task>(swimlanesRef);

  useInit(dispatch, fetchData, actions);

  const kanbanActions = useMemo(() => {
    return {
      handleDrop: async ({ from, task, to }: DropParams) => {
        const isAllowedPromise = isDropAllowed({ task, from, to });
        dispatch(actions.handleDrop({ from, task: structuredClone(task), to }));
        const isAllowed =
          typeof isAllowedPromise === "boolean"
            ? isAllowedPromise
            : await safePromiseBoolean(isAllowedPromise);
        console.log(isAllowed);
        if (!isAllowed) {
          const params = {
            from: to,
            task: structuredClone(task),
            to: from,
          };
          dispatch(actions.handleDrop(params));
          onDropFailed?.(params);
        } else {
          onDropSuccess?.({ from, task, to });
        }
      },
    };
  }, [actions, isDropAllowed, onDropFailed, onDropSuccess]);
  return { kanbanState, kanbanActions, drag, setDrag, swimlanesRef };
};
