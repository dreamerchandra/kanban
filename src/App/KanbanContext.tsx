import type { Context, FC, MutableRefObject } from "react";
import { createContext } from "vm";
import { DropParams, KanbanActions, KanbanBoardState, Task } from "./type";

interface KanbanContextParams {
  dragTask: Task | null;
  setTask: (task: Task | null) => void;
  isDropAllowed: (params: DropParams) => boolean | Promise<boolean>;
  kanbanState: KanbanBoardState | null;
  dragRef: MutableRefObject<any> | null;
  kanbanActions: KanbanActions;
}

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
