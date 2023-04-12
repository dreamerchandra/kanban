import { AnyAction, PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  Context,
  Dispatch,
  FC,
  MutableRefObject,
  createContext,
  useEffect,
} from "react";
import { DropParams, KanbanBoardState, PurgeAction, Task } from "./type";

type KanbanActions = {
  handleDrop: (params: DropParams) => void;
  purgeData: (params: PurgeAction) => void;
};
export interface KanbanContextParams {
  dragTask: Task | null;
  setTask: (task: Task | null) => void;
  isDropAllowed: (params: DropParams) => boolean | Promise<boolean>;
  kanbanState: KanbanBoardState | null;
  dragRef: MutableRefObject<any> | null;
  kanbanActions: KanbanActions;
}

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

const purgeData = (
  state: KanbanBoardState,
  actions: PayloadAction<PurgeAction>
) => {
  const { inView, endOffset, startOffset } = actions.payload;
  const { swimlaneIds } = inView;
  const allSwimlanes = Object.keys(state);
  const purgeNotInView = (id: string): void => {
    const isInView = swimlaneIds.includes(id);
    if (isInView) {
      return;
    }
    const { cols } = state[id];
    const allCollIds = Object.keys(cols);
    allCollIds.forEach((id) => {
      const col = cols[id];
      if (col) {
        // if start and end aren't specified, then we purge all
        if (startOffset == null && endOffset == null) {
          console.log("purging all");
          col.tasks = [];
          return;
        }
        // if start and end are specified then we purge only those that are not in view
        col.tasks = col.tasks.filter((_, idx) => {
          if (startOffset! <= idx && idx <= endOffset!) {
            return true;
          }
          return false;
        });
      }
    });
  };
  allSwimlanes.forEach(purgeNotInView);
};

const init = (
  state: KanbanBoardState,
  actions: PayloadAction<KanbanBoardState>
) => {
  state = actions.payload;
  return state;
};

export const kanbanSlice = createSlice({
  initialState: {},
  name: "kanban-board-slice",
  reducers: {
    handleDrop,
    init,
    purgeData,
  },
});
export const stateKanbanActions = kanbanSlice.actions;
export const kanbanReducer = kanbanSlice.reducer;

export const useInit = (
  dispatch: Dispatch<AnyAction>,
  fetchData: () => Promise<KanbanBoardState>,
  actions: typeof kanbanSlice["actions"]
) => {
  useEffect(() => {
    fetchData().then((state) => {
      dispatch(actions.init(state));
    });
  }, [actions, dispatch, fetchData]);
};

export const KanbanContext = createContext({
  dragTask: null,
  setTask: (task: Task) => {},
  isDropAllowed: (params: DropParams) => {},
  kanbanState: null,
  dragRef: null,
} as KanbanContextParams) as Context<KanbanContextParams>;

export function withKanbanContext<R>(
  Component: FC<R & KanbanContextParams>
): FC<R> {
  return (props: R) => {
    return (
      <KanbanContext.Consumer>
        {(dndProps) => <Component {...props} {...dndProps} />}
      </KanbanContext.Consumer>
    );
  };
}
