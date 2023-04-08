export const getData = async () => {
  const myWorker = new Worker(new URL("./original-data.ts", import.meta.url))
  myWorker.postMessage({ action: 'COMPUTE' })
  return new Promise((res, rej) => {
    myWorker.onmessage = (e) => {
      const state = e.data.state;
      window.kanbanState = state;
      res(state);
    }
  })
}