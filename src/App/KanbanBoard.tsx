import { FC, useCallback, useRef } from "react";
import { Swimlane } from "./KanbanComponents";
import { KanbanContext } from "./KanbanContext";
import { VirtualizedList } from "./VirtualizedList";
import cx from "./index.module.css";
import { useKanbanState } from "./kanban-state";
import { getData } from "./stub";
import { DropParams, KanbanBoardState } from "./type";

const fetchData = (): Promise<KanbanBoardState> => {
  return new Promise((res) => {
    window.addEventListener("beforeunload", () => {
      window.name = JSON.stringify(window.kanbanState);
    });
    if (window.name) {
      res(JSON.parse(window.name));
    } else {
      getData().then((state) => {
        res(state);
      });
    }
  });
};

export const KanbanBoard: FC<{
  isDropAllowed: (params: DropParams) => boolean | Promise<boolean>;
}> = ({ isDropAllowed }) => {
  const { kanbanState, kanbanActions, drag, setDrag, swimlanesRef } =
    useKanbanState({ isDropAllowed, fetchData });
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
          // ref={innerRef}
          swimlanesRef={swimlanesRef}
          numItems={swimlaneIds.length}
          itemHeight={500}
          windowHeight={window.innerHeight}
          onScroll={useCallback(
            (start, end) => {
              console.log(
                kanbanState[swimlaneIds[start]],
                kanbanState[swimlaneIds[end]]
              );
            },
            [kanbanState, swimlaneIds]
          )}
          renderItem={({ index, style }) => (
            <div style={style} key={swimlaneIds[index]}>
              <Swimlane
                swimlaneId={swimlaneIds[index]}
                kanbanState={kanbanState}
                key={swimlaneIds[index]}
              />
            </div>
          )}
        />
      </div>
    </KanbanContext.Provider>
  );
};
