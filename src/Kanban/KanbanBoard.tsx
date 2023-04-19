import React, { FC, ReactNode, useCallback, useRef } from "react";
import { Swimlane } from "./KanbanComponents";
import { KanbanContext } from "./KanbanContext";
import { VirtualizedList } from "./VirtualizedList";
import cx from "./index.module.css";
import { UseKanbanStateParam, useKanbanState } from "./kanban-state";
import { inMemoryBuffer } from "./knob";
import { Id, Task } from "./type";

export interface KanbanBoardProps<GenericTask extends { id: Id }>
  extends UseKanbanStateParam<Task<GenericTask>> {
  taskCardRenderer: FC<{
    id: GenericTask["id"];
    extra: GenericTask;
    highlight: boolean;
  }>;
  children?: ReactNode;
}

export const KanbanBoard = <GenericTask extends { id: Id }>({
  isDropAllowed,
  fetchData,
  taskCardRenderer,
}: KanbanBoardProps<GenericTask>): JSX.Element => {
  const { kanbanState, kanbanActions, drag, setDrag, swimlanesRef } =
    useKanbanState<Task>({ isDropAllowed, fetchData });
  const swimlaneIds = Object.keys(kanbanState);
  const dragRef = useRef();

  return (
    <KanbanContext.Provider
      value={{
        dragTask: drag,
        setTask: setDrag,
        isDropAllowed,
        kanbanState,
        kanbanActions,
        dragRef,
      }}
    >
      <div
        className={cx.parent}
        onDragEndCapture={(e) => {
          setDrag(null);
        }}
      >
        <VirtualizedList
          swimlanesRef={swimlanesRef}
          numItems={swimlaneIds.length}
          itemHeight={500}
          windowHeight={window.innerHeight}
          onScroll={useCallback(
            (start, end) => {
              const inMemStart =
                start - inMemoryBuffer > 0 ? start - inMemoryBuffer : 0;
              const inMemEnd =
                end + inMemoryBuffer < swimlaneIds.length
                  ? end + inMemoryBuffer
                  : swimlaneIds.length;
              kanbanActions.purgeData({
                inView: {
                  swimlaneIds: swimlaneIds.slice(inMemStart, inMemEnd + 1),
                },
                endOffset: 10,
                startOffset: 0,
              });
            },
            [kanbanActions, swimlaneIds]
          )}
          renderItem={({ index, style }) => (
            <div style={style} key={swimlaneIds[index]}>
              <Swimlane
                swimlaneId={swimlaneIds[index]}
                kanbanState={kanbanState}
                key={swimlaneIds[index]}
                taskCardRenderer={taskCardRenderer}
              />
            </div>
          )}
        />
      </div>
    </KanbanContext.Provider>
  );
};
