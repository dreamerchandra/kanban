import KanbanBoard, {
  KanbanBoardState,
  KanbanSwimlanes,
  LayoutFetchResponse,
  KanbanColumns,
} from "../../../src/Kanban";
import "kanban/dist/style.css";
import { getData } from "./stub";
import cx from "./index.module.css";
import { MyTask } from "./type";
import { useCallback } from "react";
import { Task } from "../../../src/Kanban/type";
const isAllowedBE = (): Promise<boolean> => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      1 ? res(true) : rej(false);
    }, 1500);
  });
};

let cachedState: KanbanBoardState;
const fetchData = (): Promise<KanbanBoardState<any>> => {
  if (cachedState) {
    return Promise.resolve(cachedState);
  }
  return new Promise((res) => {
    getData().then((state) => {
      cachedState = state;
      res(state);
    });
  });
};

function Kanban() {
  return (
    <KanbanBoard<MyTask>
      isDropAllowed={isAllowedBE}
      layoutFetch={async () => {
        const res = await fetchData();
        const ids = Object.keys(res);
        const colIds = Object.keys(res[ids[0]].cols);
        return {
          swimlaneIds: ids.map((id) => ({
            id: id,
            count: res[id].count,
            extra: res[id].extra,
            label: res[id].label,
          })),
          columnIds: colIds.map((id) => ({
            id: id,
            extra: res[ids[0]].cols[id].extra,
            label: res[ids[0]].cols[id].label,
          })),
        } as LayoutFetchResponse<any, any>;
      }}
      taskCardRenderer={({ extra, highlight }) => {
        return (
          <div className={`${cx.task} ${highlight ? cx.highlight : ""}`}>
            <div>
              <div className={cx.circle} />
            </div>
            <div className={cx.taskTitle}>{extra.name}</div>
          </div>
        );
      }}
      height={1000}
      swimlaneColumnFetch={fetchData}
      swimlaneFetch={useCallback(
        async ({ swimlaneIds }): Promise<KanbanBoardState<any>> => {
          const res = await fetchData();
          const ids = Object.keys(res);
          const colIds = Object.keys(res[ids[0]].cols);
          const result = swimlaneIds.reduce((acc, swimlaneId) => {
            acc[swimlaneId] = {
              id: swimlaneId,
              count: res[swimlaneId].count,
              extra: res[swimlaneId].extra,
              label: res[swimlaneId].label,
              cols: colIds.reduce((colAcc, colId) => {
                colAcc[colId] = {
                  id: colId,
                  extra: res[swimlaneId].cols[colId].extra,
                  label: res[swimlaneId].cols[colId].label,
                  tasks: res[swimlaneId].cols[colId].tasks as Task<MyTask>[],
                  count: res[swimlaneId].cols[colId].count,
                };
                return colAcc;
              }, {} as KanbanSwimlanes["cols"]),
            };
            return acc;
          }, {} as KanbanBoardState<any>);
          console.log(
            "fetched for swimlanes",
            swimlaneIds.map((id) => result[id].label)
          );
          return result;
        },
        []
      )}
    />
  );
}

export default Kanban;
