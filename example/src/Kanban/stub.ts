import { computeState } from "./state";

export const getData = async () => {
  // const myWorker = new Worker(new URL("./state", import.meta.url), {
  //   type: "module",
  // });
  // myWorker.postMessage({ action: "COMPUTE" });
  // return new Promise((res, rej) => {
  //   myWorker.onmessage = (e) => {
  //     const state = e.data.state;
  //     // @ts-ignore
  //     window.kanbanState = state;
  //     res(state);
  //   };
  // });
  return computeState();
};
