import { KanbanBoard } from "./App";
// import "./index.css";

// const isAllowedBE = (): Promise<boolean> => {
//   return new Promise((res, rej) => {
//     setTimeout(() => {
//       allowedProbability ? res(true) : rej(false);
//     }, 1500);
//   });
// };

// const fetchData = (): Promise<KanbanBoardState> => {
//   return new Promise((res) => {
//     window.addEventListener("beforeunload", () => {
//       window.name = JSON.stringify(window.kanbanState);
//     });
//     if (window.name) {
//       window.kanbanState = JSON.parse(window.name);
//       res(window.kanbanState);
//     } else {
//       getData().then((state) => {
//         res(state);
//       });
//     }
//   });
// };

export default KanbanBoard;

// ReactDOM.render(
//   <React.StrictMode>
//     <KanbanBoard isDropAllowed={isAllowedBE} fetchData={fetchData} />
//   </React.StrictMode>,
//   document.getElementById("root") as HTMLElement
// );
