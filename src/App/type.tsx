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
 * @property {Object<string, KanbanCol>} cols
 */

/**
 * @typedef {Object<string, KanbanSwimlanes>} KanbanBoardState
 */

export type Id = string | number;

export interface Task<TaskDetails = { id: Id }> {
  id: Id;
  colId: Id;
  swimlaneId: Id;
  label: string;
  extra: TaskDetails;
}

export interface KanbanCol<ColDetails = { id: Id }, TaskDetails = { id: Id }> {
  id: Id;
  label: string;
  count: number;
  extra: ColDetails;
  tasks: Task<TaskDetails>[];
}

interface KanbanSwimlanes<
  SwimlanesDetails = { id: Id },
  ColDetails = { id: Id },
  TaskDetails = { id: Id }
> {
  id: Id;
  label: string;
  count: number;
  extra: SwimlanesDetails;
  cols: {
    [key: string]: KanbanCol<ColDetails, TaskDetails>;
  };
}

export interface KanbanBoardState<
  TaskDetails = { id: Id },
  SwimlanesDetails = { id: Id },
  ColDetails = { id: Id }
> {
  [key: string]: KanbanSwimlanes<SwimlanesDetails, ColDetails, TaskDetails>;
}

export interface KanbanActions {
  handleDrop: ({ from, task, to }: DropParams) => Promise<void>;
}

// convert KanbanContext to interface
export interface KanbanContextInterface<AnySwimlane, AnyCol, AnyTask> {
  dragTask: Task | null;
  setTask: <T>(task: Task<T>) => void;
  isDropAllowed: boolean;
  kanbanState: KanbanBoardState<AnySwimlane, AnyCol, AnyTask>;
  kanbanActions: KanbanActions;
  dragRef: React.RefObject<HTMLDivElement>;
}

export interface DropParams {
  from: { colId: Id; swimlaneId: Id };
  task: Task;
  to: { colId: Id; swimlaneId: Id };
}
