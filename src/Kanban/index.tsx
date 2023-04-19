import { FC } from "react";
import { KanbanBoard as Atom } from "./KanbanBoard";
import type { UseKanbanStateParam } from "./kanban-state";

const KanbanBoard: FC<UseKanbanStateParam> = (props) => {
  return <Atom {...props} />;
};

export default KanbanBoard;
export type { UseKanbanStateParam } from "./kanban-state";
export type { DropParams, KanbanBoardState, PurgeAction } from "./type";
