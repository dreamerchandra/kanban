/**
 * @typedef Task
 * @type {object}
 * @property {string} id
 * @property {number} colId
 * @property {number} rowId
 */

/**
 * @typedef KanbanCol
 * @type {object}
 * @property {string} id
 * @property {string} label
 * @property {number} count
 * @property {Array<Task>} tasks
 */

/**
 * @typedef KanbanRow
 * @type {object}
 * @property {string} id
 * @property {string} label
 * @property {number} count
 * @property {Object<string, KanbanColumns>} cols
 */

/**
 * @typedef {Object<string, KanbanSwimlanes>} KanbanBoardState
 */

export type Id = string | number;

export type NetworkState = "idle" | "loading" | "failed" | "success";
export interface Task<TaskDetails = { id: Id }> {
  id: Id;
  colId: Id;
  swimlaneId: Id;
  label: string;
  extra: TaskDetails;
  isDropped: boolean;
}

export interface KanbanColumns<
  ColDetails = { id: Id },
  TaskDetails = { id: Id }
> {
  id: Id;
  label: string;
  count: number; // purging does not update count. This is to give an heads up on number of tasks in a col
  extra: ColDetails;
  tasks: Task<TaskDetails>[];
  networkState: NetworkState;
  backendPagination: {
    memoryInBlock: number;
    blockSize: number;
  };
}

export interface KanbanSwimlanes<
  SwimlanesDetails = { id: Id },
  ColDetails = { id: Id },
  TaskDetails = { id: Id }
> {
  id: Id;
  label: string;
  count: number;
  extra: SwimlanesDetails;
  networkState: NetworkState;
  cols: {
    [key: string]: KanbanColumns<ColDetails, TaskDetails>;
  };
}

export interface KanbanBoardState<
  TaskDetails = { id: Id },
  SwimlanesDetails = { id: Id },
  ColDetails = { id: Id }
> {
  [key: string]: KanbanSwimlanes<SwimlanesDetails, ColDetails, TaskDetails>;
}

// convert KanbanContext to interface
export interface KanbanContextInterface<
  KanbanActions,
  AnySwimlane,
  AnyCol,
  AnyTask
> {
  dragTask: Task | null;
  setTask: <T>(task: Task<T>) => void;
  isDropAllowed: boolean;
  kanbanState: KanbanBoardState<AnySwimlane, AnyCol, AnyTask>;
  kanbanActions: KanbanActions;
  dragRef: React.RefObject<HTMLDivElement>;
}

export interface DropParams<TaskDetails = { id: Id }> {
  from: { colId: Id; swimlaneId: Id };
  task: Task<TaskDetails>;
  to: { colId: Id; swimlaneId: Id };
}

export interface PurgeAction {
  inView: {
    swimlaneIds: Id[];
  };
  startOffset?: number;
  endOffset?: number;
}

export interface ColumnPaginationAction<TaskDetails = { id: Id }> {
  swimlaneId: Id;
  columnId: Id;
  tasks: Task<TaskDetails>[];
}

export type UpdateSwimlaneParams<T = { id: Id }> =
  KanbanBoardState<T>;

export type UpdateSwimlaneRequestStatus = {
  swimlaneIds: Id[];
  status: NetworkState;
};

export type LayoutFetch = <
  SwimlaneExtra = { id: Id },
  ColumnExtra = { id: Id }
>() => Promise<LayoutFetchResponse<SwimlaneExtra, ColumnExtra>>;

export type GetRowAndColumnForTaskIdResponse = {
  values: {
    swimlaneId: Id;
    columnIds: Id[];
  }[];
  isAllowed: boolean;
};


export type PaginatedSwimlaneFetch = <TaskDetails>(
  params: SwimlaneFetchParams
) => Promise<UpdateSwimlaneParams<TaskDetails>>;

export type PaginatedSwimlaneColumnFetch = <TaskDetails>(
  params: PaginatedSwimlaneColumnFetchParams
) => Promise<Task<TaskDetails>[]>;

export interface SwimlaneFetchParams {
  swimlaneIds: Id[];
  startOffset: number;
  endOffset: number;
}

export interface PaginatedSwimlaneColumnFetchParams {
  swimlaneId: Id;
  startOffset: number;
  endOffset: number;
  columnId: Id;
}

export interface LayoutFetchResponse<SwimlaneExtra, ColumnExtra> {
  swimlane: {
    id: Id;
    count: number;
    label: string;
    extra: SwimlaneExtra;
    column: {
      id: Id;
      count: number;
      extra: ColumnExtra;
      label: string;
    }[];
  }[];
}


export interface TaskCardRendererProps {
    id: Task["id"];
    extra?: Task["extra"];
    highlight: boolean;
    isLoading: boolean;
  }