export const getData = async () => {
  const myWorker = new Worker(new URL("./state.js", import.meta.url))
  myWorker.postMessage({ action: 'COMPUTE' })
  return new Promise((res, rej) => {
    myWorker.onmessage = (e) => {
      const state = e.data.state;
      res(state);
    }
  })
}