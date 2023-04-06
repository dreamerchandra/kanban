import { FC, memo, useCallback, useLayoutEffect, useState } from "react";
import { withKanbanContext } from "./KanbanContext";
import { VirtualizedList } from "./VirtualizedList";
import cx from "./index.module.css";
import { highlightInterval } from "./knob";
import { Task as ITask, Id, KanbanBoardState, KanbanCol } from "./type";

interface TaskProps {
  task: ITask;
  highlight: boolean;
}

const Task = withKanbanContext<TaskProps>(({ task, setTask, highlight }) => {
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
        e.dataTransfer.setData("text/plan", JSON.stringify({ task }));
        e.dataTransfer.dropEffect = "move";
        setTask(task);
        setDrag(true);
      }}
      onDragEnd={(e) => {
        e.dataTransfer.clearData();
        setTask(null);
        setDrag(false);
      }}
    >
      <div className={cx.task}>
        <div>
          <div className={cx.circle} />
        </div>
        <div className={cx.taskTitle}>{task.label}</div>
      </div>
    </div>
  );
});

interface CounterProps {
  count: number;
  className?: string;
}

const Counter: FC<CounterProps> = ({ count, className }) => {
  const [meta, setMeta] = useState({ count, highlight: false });
  useLayoutEffect(() => {
    let timerId = 0;
    timerId = window.setTimeout(() => {
      setMeta((oldMeta) => {
        if (oldMeta.count === count) {
          return oldMeta;
        }
        setTimeout(() => {
          setMeta({
            count,
            highlight: false,
          });
        }, 1000);
        setTimeout(() => {
          setMeta({
            count,
            highlight: true,
          });
        }, 500);
        return {
          count: oldMeta.count,
          highlight: true,
        };
      });
    }, highlightInterval);
    return () => clearTimeout(timerId);
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
}

const Col = withKanbanContext<ColProps>(
  memo(
    ({ col, swimlaneId, kanbanActions, setTask }) => {
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
            const { task } = JSON.parse(e.dataTransfer.getData("text/plan"));
            const from = { swimlaneId: task.rowId, colId: task.colId };
            const to = { colId: col.id, swimlaneId };
            e.dataTransfer.clearData();
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
                windowHeight={384}
                onScroll={useCallback((start, end) => {
                  console.log(start, end);
                }, [])}
                renderItem={({ index, style }) => {
                  return (
                    <div style={style} key={col.tasks[index].id}>
                      <Task
                        task={col.tasks[index]}
                        highlight={!oldTaskIds.includes(col.tasks[index].id)}
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
}

export const Swimlane = withKanbanContext<RowProps>(
  ({ swimlaneId: rowId, kanbanState }) => {
    const row = kanbanState[rowId];
    return (
      <div className={cx.row}>
        <div className={cx.rowHeader}>
          <span className={cx.pill}>{row.label}</span>
          <Counter className={cx.count} count={row.count} />
        </div>
        <div className={cx.colWrapper}>
          {Object.values(row.cols).map((col) => (
            <Col col={col} key={col.id} swimlaneId={rowId} />
          ))}
        </div>
      </div>
    );
  }
);
