import randomWords from "random-words";
import { MyTask } from "./type";

const colCount = 10;
const swimlanesCount = 500;
const maxTaskCount = 100;
const allowedProbability = 1;
const highlightInterval = 1000;
const emptyCol = 7;
const inMemoryBuffer = 10;

const slowScroll = 8;
const speedScroll = 16;

const randomWord = () => randomWords(1).join(" ");
const constructTask = () => {
  const taskName = randomWords(1).join(" ");
  const taskId = Math.random();
  return {
    id: Math.random(),
    label: taskName,
    extra: {
      name: taskName,
      id: taskId,
      projectName: randomWords(1).join(" "),
    } as MyTask,
  };
};

const constructDetail = () => ({ id: Math.random(), label: randomWord() });
const constructDetails = (count: any) =>
  [...new Array(count)].map(constructDetail);

const colMeta = constructDetails(colCount);

export const computeState = () =>
  constructDetails(swimlanesCount).reduce((preRow, swimlane, idx) => {
    const cols = colMeta.reduce((preCol, col) => {
      const taskCount =
        (idx + 1) % emptyCol ? Math.floor(Math.random() * maxTaskCount) : 0;
      return {
        ...preCol,
        [col.id]: {
          ...col,
          count: taskCount,
          tasks: constructDetails(taskCount).map((task) => ({
            ...constructTask(),
            colId: col.id,
            swimlaneId: swimlane.id,
          })),
        },
      };
    }, {});
    return {
      ...preRow,
      [swimlane.id]: {
        id: swimlane.id,
        label: swimlane.label,
        count: Object.values(cols).reduce(
          (sum, col) => (col as any).count + sum,
          0
        ),
        cols,
      },
    };
  }, {});

// eslint-disable-next-line no-restricted-globals
self.onmessage = (e) => {
  const { action } = e.data;
  if (action === "COMPUTE") {
    const state = computeState();
    // eslint-disable-next-line no-restricted-globals
    self.postMessage({ state });
  }
};

export {};
