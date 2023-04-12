import "../../../dist/style.css";
import KanbanBoard from "../../../src";
import { getData } from "./stub";

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
  return <KanbanBoard isDropAllowed={isAllowedBE} fetchData={fetchData} />;
}

export default Kanban;
