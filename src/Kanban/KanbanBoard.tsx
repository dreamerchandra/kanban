import React, { FC, ReactNode, useCallback, useEffect, useRef } from "react";
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
  SwimlaneFetchParams,
  Task,
  TaskCardRendererProps,
} from "./type";
import { getKanbanFetchStatus } from "./utils";

export interface KanbanBoardProps<GenericTask extends { id: Id }>
  extends UseKanbanStateParam {
  swimlaneFetch: PaginatedSwimlaneFetch;
  swimlaneColumnFetch: PaginatedSwimlaneColumnFetch;
  taskCardRenderer: FC<TaskCardRendererProps>;
  taskCardLoadingRenderer: FC<TaskCardRendererProps>;
  children?: ReactNode;
  height: number;
}

export const KanbanBoard = <GenericTask extends { id: Id }>({
  isDropAllowed,
  swimlaneFetch,
  swimlaneColumnFetch,
  taskCardRenderer,
  height,
  layoutFetch,
  taskCardLoadingRenderer,
}: KanbanBoardProps<GenericTask>): JSX.Element => {
  const { kanbanState, kanbanActions, drag, setDrag, swimlanesRef } =
    useKanbanState<Task>({ isDropAllowed, layoutFetch });
  const kanbanFetchStatus = getKanbanFetchStatus(kanbanState);
  const kanbanFetchStatusRef = useRef(kanbanFetchStatus);
  useEffect(() => {
    kanbanFetchStatusRef.current = kanbanFetchStatus;
  }, [kanbanFetchStatus]);
  const swimlaneIds = Object.keys(kanbanFetchStatus);
  const dragRef = useRef();

  const swimlaneFetcher = useCallback(
    async (params: SwimlaneFetchParams) => {
      console.log(kanbanFetchStatusRef.current, params.swimlaneIds);
      const idsToBeFetched = params.swimlaneIds.filter((id) =>
        kanbanFetchStatusRef.current[id]
          ? kanbanFetchStatusRef.current[id].networkState === "idle"
          : true
      );
      if (idsToBeFetched.length === 0) {
        return;
      }
      kanbanActions.updateSwimlaneRequestStatus({
        status: "loading",
        swimlaneIds: idsToBeFetched,
      });
      return swimlaneFetch<GenericTask>({
        ...params,
        swimlaneIds: idsToBeFetched,
      })
        .then((res) => {
          kanbanActions.updateSwimlaneRequestStatus({
            status: "success",
            swimlaneIds: idsToBeFetched,
          });
          kanbanActions.updatePaginatedSwimlane(res);
          return res;
        })
        .catch(() => {
          kanbanActions.updateSwimlaneRequestStatus({
            status: "failed",
            swimlaneIds: idsToBeFetched,
          });
        });
    },
    [swimlaneFetch, kanbanActions]
  );

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
          name='swimlanes'
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
              await swimlaneFetcher({
                swimlaneIds: swimlanesInViewIds,
                endOffset: end,
                startOffset: start,
              });
              kanbanActions.purgeData({
                inView: {
                  swimlaneIds: swimlanesInViewIds,
                },
                endOffset: 10,
                startOffset: 0,
              });
            },
            [kanbanActions, swimlaneIds]
          )}
          onMount={useCallback(
            async (start, end) => {
              if (end === -1) {
                return;
              }
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
                await swimlaneFetcher({
                  swimlaneIds: swimlanesInViewIds,
                  endOffset: end,
                  startOffset: start,
                });
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
                taskCardLoadingRenderer={taskCardLoadingRenderer}
                swimlaneColumnFetch={swimlaneColumnFetch}
              />
            </div>
          )}
        />
      </div>
    </KanbanContext.Provider>
  );
};
