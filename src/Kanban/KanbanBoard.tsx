import React, { FC, ReactNode, useCallback, useRef } from "react";
import { Swimlane } from "./KanbanComponents";
import { KanbanContext } from "./KanbanContext";
import { VirtualizedList } from "./VirtualizedList";
import cx from "./index.module.css";
import { UseKanbanStateParam, useKanbanState } from "./kanban-state";
import { inMemoryBuffer } from "./knob";
import {
  Id,
  PaginatedSwimlaneColumnFetch,
  PaginatedSwimlaneFetch,
  Task,
} from "./type";

export interface KanbanBoardProps<GenericTask extends { id: Id }>
  extends UseKanbanStateParam {
  swimlaneFetch: PaginatedSwimlaneFetch;
  swimlaneColumnFetch: PaginatedSwimlaneColumnFetch;
  taskCardRenderer: FC<{
    id: GenericTask["id"];
    extra: GenericTask;
    highlight: boolean;
  }>;
  children?: ReactNode;
  height: number;
}

export const KanbanBoard = <GenericTask extends { id: Id }>({
  isDropAllowed,
  swimlaneFetch,
  swimlaneColumnFetch,
  taskCardRenderer,
  height,
  layoutFetch: fetchData,
}: KanbanBoardProps<GenericTask>): JSX.Element => {
  const { kanbanState, kanbanActions, drag, setDrag, swimlanesRef } =
    useKanbanState<Task>({ isDropAllowed, layoutFetch: fetchData });
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
        onDragEndCapture={() => {
          setDrag(null);
        }}
      >
        <VirtualizedList
          swimlanesRef={swimlanesRef}
          numItems={swimlaneIds.length}
          itemHeight={500}
          parentHeight={height}
          debounceTimer={400}
          onScroll={useCallback(
            async (start, end) => {
              console.log("fetch on scroll", start, end);
              const inMemStart =
                start - inMemoryBuffer > 0 ? start - inMemoryBuffer : 0;
              const inMemEnd =
                end + inMemoryBuffer < swimlaneIds.length
                  ? end + inMemoryBuffer
                  : swimlaneIds.length;
              const swimlanesInViewIds = swimlaneIds.slice(
                inMemStart,
                inMemEnd + 1
              );
              const res = await swimlaneFetch<GenericTask>({
                swimlaneIds: swimlanesInViewIds,
              });
              kanbanActions.updateSwimlaneTask(res);

              kanbanActions.purgeData({
                inView: {
                  swimlaneIds: swimlanesInViewIds.slice(
                    inMemStart,
                    inMemEnd + 1
                  ),
                },
                endOffset: 10,
                startOffset: 0,
              });
            },
            [kanbanActions, swimlaneIds]
          )}
          onMount={useCallback(
            async (start, end) => {
              requestAnimationFrame(async () => {
                const inMemStart =
                  start - inMemoryBuffer > 0 ? start - inMemoryBuffer : 0;
                const inMemEnd =
                  end + inMemoryBuffer < swimlaneIds.length
                    ? end + inMemoryBuffer
                    : swimlaneIds.length;
                const swimlanesInViewIds = swimlaneIds.slice(
                  inMemStart,
                  inMemEnd + 1
                );
                console.log(start, end);
                const res = await swimlaneFetch<GenericTask>({
                  swimlaneIds: swimlanesInViewIds,
                });
                kanbanActions.updateSwimlaneTask(res);
              });
            },
            [swimlaneIds]
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
