import KanbanBoard from "../../../src/Kanban";
import "kanban/dist/style.css";
import { getData } from "./stub";
import cx from "./index.module.css";
import { MyTask } from "./type";
const isAllowedBE = (): Promise<boolean> => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      1 ? res(true) : rej(false);
    }, 1500);
  });
};

const fetchData = (): Promise<any> => {
  return new Promise((res) => {
    getData().then((state) => {
      res(state);
    });
  });
};

function Kanban() {
  return (
    <KanbanBoard<MyTask>
      isDropAllowed={isAllowedBE}
      fetchData={fetchData}
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
    />
  );
}

export default Kanban;
