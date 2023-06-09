import React, { FC, memo, useCallback, useLayoutEffect, useRef, useState } from "react";
import { withKanbanContext } from "./KanbanContext";
import { VirtualizedList } from "./VirtualizedList";
import cx from "./index.module.css";
import { highlightInterval, loadingCardCount } from "./knob";
import {
  Task as ITask,
  Id,
  KanbanBoardState,
  KanbanColumns,
  PaginatedSwimlaneColumnFetch,
  TaskCardRendererProps,
} from "./type";
import { Task } from "./type";

interface TaskProps {
  task?: ITask;
  highlight: boolean;
  taskCardRenderer: FC<TaskCardRendererProps>;
  isLoading: boolean;
}

const TaskCardRenderer = withKanbanContext<TaskProps>(
  ({
    task,
    setTask,
    highlight,
    taskCardRenderer: ConsumerTaskRenderer,
    isLoading,
  }) => {
    const [drag, setDrag] = useState(false);
    const [shouldHighlight, setShouldHighlight] = useState(false);
    const dragRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      const timerId = setTimeout(() => {
        setShouldHighlight(highlight);
      }, 25);
      return () => clearTimeout(timerId);
    }, [highlight]);
    return (
      <>
        <div
          id={task?.id + ""}
          className={`${cx.taskWrapper}`}
          draggable={isLoading ? false : true}
          onDragStart={(e) => {
            if (!task) return;
            e.persist();
            e.dataTransfer.clearData();
            e.dataTransfer.setData("text/plan", JSON.stringify({ task }));
            if (!dragRef.current) return;
            const taskWrapper = (e.target as any).cloneNode(true);
            dragRef.current.innerHTML = taskWrapper.innerHTML;
            (dragRef.current.childNodes[0] as any).style.transform = "rotate(-1deg)";
            e.dataTransfer.setDragImage(dragRef.current, 50, 50);
            dragRef.current.style.display = "block";
            setTimeout(() => {
              if (!dragRef.current) return;
              console.log("test");
              dragRef.current.style.display = "none";
            }, 0);
            e.dataTransfer.dropEffect = "move";
            setTask(task!);
            setDrag(true);
          }}
          onDragEnd={(e) => {
            e.preventDefault();
            if (dragRef.current) {
              dragRef.current.innerHTML = "";
            }
            e.dataTransfer.clearData();
            setTask(null);
            setDrag(false);
          }}
        >
          <ConsumerTaskRenderer
            id={task?.id ?? ""}
            extra={task?.extra}
            highlight={false}
            isLoading={isLoading}
          />
        </div>
        <div
          style={{
            position: "fixed",
            zIndex: 100,
            display: "none",
            width: "230px",
            transform: "rotate(-1deg)",
          }}
          className={`${cx.taskWrapper}`}
          ref={dragRef}
        ></div>
      </>
    );
  }
);

interface CounterProps {
  count: number;
  className?: string;
}

const Counter: FC<CounterProps> = ({ count, className }) => {
  const [meta, setMeta] = useState({ count, highlight: false });
  useLayoutEffect(() => {
    let timerIds: number[] = [];
    timerIds.push(
      window.setTimeout(() => {
        setMeta((oldMeta) => {
          if (oldMeta.count === count) {
            return oldMeta;
          }
          timerIds.push(
            window.setTimeout(() => {
              setMeta({
                count,
                highlight: false,
              });
            }, 1000)
          );
          timerIds.push(
            window.setTimeout(() => {
              setMeta({
                count,
                highlight: true,
              });
            }, 500)
          );
          return {
            count: oldMeta.count,
            highlight: true,
          };
        });
      }, highlightInterval)
    );
    return () => timerIds.forEach((id) => clearTimeout(id));
  }, [count]);
  return (
    <span
      className={`${className} ${cx.counter} ${
        meta.highlight ? cx.highlight : ""
      }`}
    >
      {meta.count}
    </span>
  );
};

interface ColProps {
  col: KanbanColumns;
  swimlaneId: Id;
  taskCardRenderer: FC<TaskCardRendererProps>;
  taskCardLoadingRenderer: FC<TaskCardRendererProps>;
  paginatedSwimlaneColumnFetch: PaginatedSwimlaneColumnFetch;
  isLoading: boolean;
}

const Col = withKanbanContext<ColProps>(
  memo(
    ({
      col,
      swimlaneId,
      kanbanActions,
      setTask,
      taskCardRenderer,
      taskCardLoadingRenderer,
      paginatedSwimlaneColumnFetch,
      isLoading
    }) => {
      const [oldTaskIds, setOldTaskIds] = useState(
        col.tasks.map((task) => task.id)
      );
      const ref = useRef<HTMLDivElement>(null);
      useLayoutEffect(() => {
        const timerId = setTimeout(() => {
          setOldTaskIds(col.tasks.map((task) => task.id));
        }, highlightInterval);
        return () => clearTimeout(timerId);
      }, [col.tasks]);

      const onScroll = useCallback(
        async (start, end) => {
          const startOffset = col.backendPagination.blockSize *
            col.backendPagination.memoryInBlock;
          const endOffset = startOffset + col.backendPagination.blockSize;
          const hasScrolled80Percent = end > col.tasks.length * 0.8;
          const isItemsToBeFetched = startOffset >= col.tasks.length;
          if (hasScrolled80Percent && isItemsToBeFetched) {
            console.log("fetching", startOffset, endOffset);
            const data = await paginatedSwimlaneColumnFetch<Task["extra"]>({
              swimlaneId: swimlaneId,
              endOffset,
              startOffset,
              columnId: col.id,
            });
            kanbanActions.updatePaginatedColumn({
              swimlaneId,
              columnId: col.id,
              tasks: data,
            });
          }
        },
        [col]
      );
      const fetchedTaskLength = col.tasks.length + 1;
      const loadingItems = isLoading
        ? loadingCardCount
        : fetchedTaskLength <= col.count
        ? Math.min(loadingCardCount, col.count - fetchedTaskLength)
        : 0;
      return (
        <div
          className={cx.col}
          key={col.id}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add(cx.colDrag);
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove(cx.colDrag);
          }}
          onDrop={(e) => {
            e.currentTarget.classList.remove(cx.colDrag);
            const { task } = JSON.parse(
              e.dataTransfer.getData("text/plan")
            ) as { task: ITask };
            e.preventDefault();
            const from = { swimlaneId: task.swimlaneId, colId: task.colId };
            const to = { colId: col.id, swimlaneId };
            kanbanActions.handleDrop({ from, task, to });
            // scroll to top
            ref.current?.scrollTo(0, 0);
            setTask(null);
          }}
        >
          <div className={cx.colInner}>
            <div className={cx.colHeader}>
              <Counter count={col.count} />
              <span>{col.label}</span>
              <span>+</span>
            </div>
            <div className={cx.tasksContainer}>
              <VirtualizedList
                ref={ref}
                name='column'
                numItems={col.tasks.length + loadingItems}
                itemHeight={120}
                parentHeight={384}
                onScroll={onScroll}
                renderItem={({ index, style }) => {
                  if (index >= col.tasks.length) {
                    return (
                      <div style={style} key={index}>
                        <TaskCardRenderer
                          task={col.tasks[index]}
                          highlight={false}
                          taskCardRenderer={taskCardLoadingRenderer}
                          isLoading
                        />
                      </div>
                    );
                  }
                  return (
                    <div style={style} key={col.tasks[index].id}>
                      <TaskCardRenderer
                        task={col.tasks[index]}
                        highlight={!oldTaskIds.includes(col.tasks[index].id)}
                        taskCardRenderer={taskCardRenderer}
                        isLoading={false}
                      />
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>
      );
    },
    (pre, cur) => {
      return (
        pre.col.tasks.length === cur.col.tasks.length &&
        pre.swimlaneId === cur.swimlaneId &&
        pre.isLoading === cur.isLoading
      );
    }
  )
);

interface RowProps {
  swimlaneId: Id;
  kanbanState: KanbanBoardState;
  taskCardRenderer: FC<TaskCardRendererProps>;
  taskCardLoadingRenderer: FC<TaskCardRendererProps>;
  swimlaneColumnFetch: PaginatedSwimlaneColumnFetch;
}

export const Swimlane = withKanbanContext(
  ({
    swimlaneId,
    kanbanState,
    taskCardRenderer,
    swimlaneColumnFetch,
    taskCardLoadingRenderer,
  }: RowProps) => {
    const swimlane = kanbanState[swimlaneId];
    console.log(swimlane.networkState === "loading");
    return (
      <div className={cx.row}>
        <div className={cx.rowHeader}>
          <span className={cx.pill}>{swimlane.label}</span>
          <Counter className={cx.count} count={swimlane.count} />
        </div>
        <div className={cx.colWrapper}>
          {Object.values(swimlane.cols).map((col) => (
            <Col
              col={col}
              key={col.id}
              swimlaneId={swimlaneId}
              taskCardRenderer={taskCardRenderer}
              paginatedSwimlaneColumnFetch={swimlaneColumnFetch}
              isLoading={swimlane.networkState === "loading"}
              taskCardLoadingRenderer={taskCardLoadingRenderer}
            />
          ))}
        </div>
      </div>
    );
  }
);
