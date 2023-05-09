import { useEffect, useRef } from "react";
import { KanbanBoardState, NetworkState } from "./type";

export const getKanbanFetchStatus = (kanbanState: KanbanBoardState) => {
  return Object.keys(kanbanState).reduce(
    (acc, id) => {
      acc[id] = {
        networkState: kanbanState[id].networkState,
      };
      return acc;
    },
    {} as Record<
      keyof KanbanBoardState,
      {
        networkState: NetworkState;
      }
    >
  );
};

export const useKanbanFetchStatus = (kanbanState: KanbanBoardState) => {
  const kanbanFetchStatus = getKanbanFetchStatus(kanbanState);
  const ref = useRef(kanbanFetchStatus);
  useEffect(() => {
    ref.current = kanbanFetchStatus;
  }, [kanbanFetchStatus]);
  return ref;
};
