import { AnyAction, PayloadAction, createSlice } from "@reduxjs/toolkit";
import React, {
  Context,
  Dispatch,
  FC,
  MutableRefObject,
  createContext,
  useEffect,
} from "react";
import {
  ColumnPaginationAction,
  DropParams,
  GetRowAndColumnForTaskIdResponse,
  Id,
  KanbanBoardState,
  KanbanSwimlanes,
  LayoutFetch,
  LayoutFetchResponse,
  PurgeAction,
  Task,
  UpdateSwimlaneParams,
  UpdateSwimlaneRequestStatus,
} from "./type";

type KanbanActions = {
  handleDrop: (params: DropParams) => void;
  purgeData: (params: PurgeAction) => void;
  updatePaginatedSwimlane: (params: UpdateSwimlaneParams) => void;
  updateSwimlaneRequestStatus: (params: UpdateSwimlaneRequestStatus) => void;
  updatePaginatedColumn: (params: ColumnPaginationAction) => void;
};
export interface KanbanContextParams<TaskDetails extends unknown = any> {
  dragTask: Task<TaskDetails> | null;
  setTask: (task: Task<TaskDetails> | null) => void;
  isDropAllowed: (
    params: DropParams<TaskDetails>
  ) =>
    | GetRowAndColumnForTaskIdResponse
    | Promise<GetRowAndColumnForTaskIdResponse>;
  kanbanState: KanbanBoardState<TaskDetails> | null;
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
    isDropped: true,
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

const upsertTaskInCells = (state: KanbanBoardState, action: PayloadAction<{values: GetRowAndColumnForTaskIdResponse['values'], task: Task}>) => {
  const {task, values} = action.payload;
  values.forEach(({swimlaneId, columnIds}) => {
    columnIds.forEach((columnId) => {
      const existingTask = state[swimlaneId].cols[columnId].tasks.find((t) => t.id === task.id);
      if (existingTask) {
        existingTask.isDropped = true;
        existingTask.extra = task.extra;
        existingTask.label = task.label;
      } else {
        state[swimlaneId].cols[columnId].tasks.unshift({
          colId: columnId,
          swimlaneId: swimlaneId,
          id: task.id,
          isDropped: true,
          extra: task.extra,
          label: task.label,
        })
      }
    })
  })
  return state;
}

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
          col.backendPagination.memoryInBlock = 0;
          console.log("purging expect dropped task");
          col.tasks = col.tasks.filter((task) => task.isDropped);
          return;
        }
        col.backendPagination.memoryInBlock = 1;
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

const initLayout = <T extends { id: Id }, R extends { id: Id }>(
  state: KanbanBoardState,
  actions: PayloadAction<LayoutFetchResponse<T, R>>
) => {
  actions.payload.swimlane.forEach((swimlane) => {
    state[swimlane.id] = {
      count: swimlane.count,
      cols: swimlane.column.reduce((acc, column) => {
        acc[column.id]= {
          count: column.count,
          tasks: [],
          extra: column.extra,
          id: column.id,
          label: column.label,
          networkState: "idle",
          backendPagination: {
            blockSize: 10,
            memoryInBlock: 0,
          },
        };
        return acc;
      }, {} as KanbanSwimlanes['cols']),
      label: swimlane.label,
      extra: swimlane.extra,
      id: swimlane.id,
      networkState: "idle",
    };
    
  });

  return state;
};

const updatePaginatedSwimlane = <T extends { id: Id }>(
  state: KanbanBoardState,
  actions: PayloadAction<UpdateSwimlaneParams<T>>
) => {
  const swimlanes = actions.payload;
  const swimlanesIdsToUpdate = Object.keys(actions.payload);
  swimlanesIdsToUpdate.forEach((id) => {
    state[id].networkState = "success";
    const colIds = Object.keys(swimlanes[id].cols);
    colIds.forEach((colId) => {
      state[id].cols[colId].extra = swimlanes[id].cols[colId].extra;
      state[id].cols[colId].id = swimlanes[id].cols[colId].id;
      state[id].cols[colId].label = swimlanes[id].cols[colId].label;
      state[id].cols[colId].tasks = [
        ...(state[id].cols[colId].tasks.filter((task) => task.isDropped) || []),
        ...swimlanes[id].cols[colId].tasks,
      ];
      state[id].cols[colId].networkState = "success";
      state[id].cols[colId].backendPagination = {
        blockSize: 10,
        memoryInBlock: 1,
      };
    });
  });

  return state;
};

const updatePaginatedColumn = <T extends { id: Id }>(
  state: KanbanBoardState,
  actions: PayloadAction<ColumnPaginationAction<T>>
) => {
  const { swimlaneId, tasks, columnId } = actions.payload;
  const existingTaskId = state[swimlaneId].cols[columnId].tasks.map(
    (t) => t.id
  );
  const uniqueTasks = tasks.filter((task) => !existingTaskId.includes(task.id));
  state[swimlaneId].cols[columnId].backendPagination.memoryInBlock += 1;
  state[swimlaneId].cols[columnId].tasks = [
    ...state[swimlaneId].cols[columnId].tasks,
    ...uniqueTasks,
  ];
  return state;
};

const updateSwimlaneFetching = (
  state: KanbanBoardState,
  actions: PayloadAction<UpdateSwimlaneRequestStatus>
) => {
  const { swimlaneIds, status } = actions.payload;
  swimlaneIds.forEach((id) => {
    state[id].networkState = status;
  });
  return state;
};


export const kanbanSlice = createSlice({
  initialState: {},
  name: "kanban-board-slice",
  reducers: {
    handleDrop,
    initLayout,
    purgeData,
    updatePaginatedSwimlane,
    updatePaginatedColumn,
    updateSwimlaneFetching,
    upsertTaskInCells,
  },
});
export const stateKanbanActions = kanbanSlice.actions;
export const kanbanReducer = kanbanSlice.reducer;

export const useInit = (
  dispatch: Dispatch<AnyAction>,
  layoutFetch: LayoutFetch,
  actions: (typeof kanbanSlice)["actions"]
) => {
  useEffect(() => {
    layoutFetch().then((state) => {
      dispatch(actions.initLayout(state));
    });
  }, [actions, dispatch, layoutFetch]);
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
