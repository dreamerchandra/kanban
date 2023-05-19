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
import { GetRowAndColumnForTaskIdResponse, Task } from "../../../src/Kanban/type";
import {ApiTask, fetchColumns, fetchLayout, fetchSwimlanes, getRowAndColumnForTaskId} from "./eg";
import randomWords from "random-words";
import { DropParams } from "kanban";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const isAllowedBE = async (
  dropParams: DropParams
): Promise<GetRowAndColumnForTaskIdResponse> => {
  const res = await getRowAndColumnForTaskId({ taskId: dropParams.task.id });
  return {
    isAllowed: true,
    values: res.map((row) => ({
      swimlaneId: row.rowId,
      columnIds: Object.keys(row.columnData),
    })),
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    <KanbanBoard<ApiTask & {id: number}>
      isDropAllowed={isAllowedBE}
      layoutFetch={async () => {
        const res = await fetchLayout();
        return {
          swimlane: res.map((row) => ({
            id: row.rowId,
            label: row.rowLabel,
            extra: null,
            count: row.totalTaskCount,
            column: Object.keys(row.columnData).map((colId) => ({
              count: row.columnData[colId].innerTaskCount,
              extra: null,
              id: colId,
              label: row.columnData[colId].colLabel,
            }))as LayoutFetchResponse<any, any>['swimlane'][0]['column'],
          })),
        } as LayoutFetchResponse<any, any>
        // const ids = Object.keys(res);
        // const colIds = Object.keys(res[ids[0]].cols);
        // return {
        //   swimlaneIds: ids.map((id) => ({
        //     id: id,
        //     count: res[id].count,
        //     extra: res[id].extra,
        //     label: res[id].label,
        //   })),
        //   columnIds: colIds.map((id) => ({
        //     id: id,
        //     extra: res[ids[0]].cols[id].extra,
        //     label: res[ids[0]].cols[id].label,
        //   })),
        // } as LayoutFetchResponse<any, any>;
      }}
      taskCardRenderer={({ extra, highlight }) => {
        return (
          <div className={`${cx.task} ${highlight ? cx.highlight : ""}`}>
            <div>
              <div className={cx.circle} />
            </div>
            <div className={cx.taskTitle}>{extra.taskName}</div>
          </div>
        );
      }}
      height={1000}
      swimlaneColumnFetch={useCallback(
        async ({ columnId, endOffset, startOffset, swimlaneId }) => {
          const res = await fetchColumns({
            offsetCol: startOffset,
            colId: columnId,
            rowId: swimlaneId,
          });
          return res.columnData[columnId]?.tasks.map((task) => ({
            colId: columnId,
            extra: {...task, id: task.taskId},
            id: task.taskId,
            rowId: swimlaneId,
            isDropped: true,
            label: task.taskName,
            swimlaneId: swimlaneId,
          })) ?? [] as Task<ApiTask &{id: number}>[];
          // const res = await fetchData();
          // return res[swimlaneId].cols[columnId].tasks.slice(
          //   startOffset,
          //   endOffset
          // );
        },
        []
      )}
      swimlaneFetch={useCallback(
        async ({ swimlaneIds, endOffset, startOffset }): Promise<KanbanBoardState<any>> => {
          console.log(swimlaneIds);
          const res = await fetchSwimlanes({ swimlaneIds });
          return res.reduce((acc, row) => {
            acc[row.rowId] = {
              extra: {
                id: row.rowId,
              },
              id: row.rowId,
              networkState: "success",
              label: row.rowLabel,
              cols: Object.keys(row.columnData).reduce((acc, colId) => {
                acc[colId] = {
                  id: colId,
                  tasks:
                    row.columnData[colId]?.tasks.map((task) => ({
                      colId: colId,
                      extra: { ...task, id: task.taskId },
                      id: task.taskId,
                      isDropped: true,
                      label: task.taskName,
                      rowId: row.rowId,
                      swimlaneId: row.rowId,
                    })) ?? [],
                  extra: {
                    id: colId,
                  },
                  label: row.columnData[colId]?.colLabel ?? "",
                  networkState: "success",
                };
                return acc;
              }, {} as KanbanSwimlanes["cols"]),
            };
            return acc;
          }, {} as KanbanBoardState<any>);
          // const res = await fetchData();
          // const ids = Object.keys(res);
          // const colIds = Object.keys(res[ids[0]].cols);
          // const result = swimlaneIds.reduce((acc, swimlaneId) => {
          //   acc[swimlaneId] = {
          //     id: swimlaneId,
          //     count: res[swimlaneId].count,
          //     extra: res[swimlaneId].extra,
          //     label: res[swimlaneId].label,
          //     cols: colIds.reduce((colAcc, colId) => {
          //       colAcc[colId] = {
          //         id: colId,
          //         extra: res[swimlaneId].cols[colId].extra,
          //         label: res[swimlaneId].cols[colId].label,
          //         tasks: res[swimlaneId].cols[colId].tasks.slice(
          //           0,
          //           10
          //         ) as Task<MyTask>[],
          //         count: res[swimlaneId].cols[colId].count,
          //       };
          //       return colAcc;
          //     }, {} as KanbanSwimlanes["cols"]),
          //   };
          //   return acc;
          // }, {} as KanbanBoardState<any>);
          // console.log(
          //   "fetched for swimlanes",
          //   swimlaneIds.map((id) => result[id].label)
          // );
          // return result;
        },
        []
      )}
      taskCardLoadingRenderer={() => {
        return (
          <div className={cx.taskLoading}>
            <SkeletonTheme baseColor='#fff' highlightColor='var(--cool-gray-10)'>
              <Skeleton count={1} width={256} height={112} />
            </SkeletonTheme>
          </div>
        );
      }}
    />
  );
}

export default Kanban;
