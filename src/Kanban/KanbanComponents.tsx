import React, { FC, memo, useCallback, useLayoutEffect, useState } from "react";
import { withKanbanContext } from "./KanbanContext";
import { VirtualizedList } from "./VirtualizedList";
import cx from "./index.module.css";
import { highlightInterval } from "./knob";
import { Task as ITask, Id, KanbanBoardState, KanbanCol } from "./type";
import { Task } from "./type";

interface TaskProps {
  task: ITask;
  highlight: boolean;
  taskCardRenderer: FC<{
    id: Task["id"];
    extra: Task["extra"];
    highlight: boolean;
  }>;
}

const TaskCardRenderer = withKanbanContext<TaskProps>(
  ({ task, setTask, highlight, taskCardRenderer: ConsumerTaskRenderer }) => {
    const [drag, setDrag] = useState(false);
    const [shouldHighlight, setShouldHighlight] = useState(false);
    useLayoutEffect(() => {
      const timerId = setTimeout(() => {
        setShouldHighlight(highlight);
      }, 25);
      return () => clearTimeout(timerId);
    }, [highlight]);
    return (
      <div
        id={task.id + ""}
        className={`${cx.taskWrapper} ${drag ? cx.drag : ""} ${
          shouldHighlight ? cx.highlight : ""
        }`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.clearData();
          e.dataTransfer.setData("text/plan", JSON.stringify({ task }));
          e.dataTransfer.dropEffect = "move";
          setTask(task);
          setDrag(true);
        }}
        onDragEnd={(e) => {
          e.preventDefault();
          e.dataTransfer.clearData();
          setTask(null);
          setDrag(false);
        }}
      >
        <ConsumerTaskRenderer
          id={task.id}
          extra={task.extra}
          highlight={shouldHighlight || drag}
        />
      </div>
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
  col: KanbanCol;
  swimlaneId: Id;
  taskCardRenderer: FC<{
    id: Task["id"];
    extra: Task["extra"];
    highlight: boolean;
  }>;
}

const Col = withKanbanContext<ColProps>(
  memo(
    ({ col, swimlaneId, kanbanActions, setTask, taskCardRenderer }) => {
      const [oldTaskIds, setOldTaskIds] = useState(
        col.tasks.map((task) => task.id)
      );
      useLayoutEffect(() => {
        const timerId = setTimeout(() => {
          setOldTaskIds(col.tasks.map((task) => task.id));
        }, highlightInterval);
        return () => clearTimeout(timerId);
      }, [col.tasks]);

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
                numItems={col.tasks.length}
                itemHeight={120}
                parentHeight={384}
                onScroll={useCallback((start, end) => {
                  console.log(start, end);
                }, [])}
                renderItem={({ index, style }) => {
                  return (
                    <div style={style} key={col.tasks[index].id}>
                      <TaskCardRenderer
                        task={col.tasks[index]}
                        highlight={!oldTaskIds.includes(col.tasks[index].id)}
                        taskCardRenderer={taskCardRenderer}
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
        pre.swimlaneId === cur.swimlaneId
      );
    }
  )
);

interface RowProps {
  swimlaneId: Id;
  kanbanState: KanbanBoardState;
  taskCardRenderer: FC<{
    id: Task["id"];
    extra: any;
    highlight: boolean;
  }>;
}

export const Swimlane = withKanbanContext(
  ({ swimlaneId, kanbanState, taskCardRenderer }: RowProps) => {
    const swimlane = kanbanState[swimlaneId];
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
            />
          ))}
        </div>
      </div>
    );
  }
);
