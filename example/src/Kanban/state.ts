import randomWords from "random-words";

const colCount = 10;
const swimlanesCount = 25;
const maxTaskCount = 100;
const allowedProbability = 1;
const highlightInterval = 1000;
const emptyCol = 7;
const inMemoryBuffer = 10;

const slowScroll = 8;
const speedScroll = 16;

const randomWord = () => randomWords(5);

const constructDetail = () => ({ id: Math.random(), label: randomWord() });
const constructDetails = (count: any) =>
  [...new Array(count)].map(constructDetail);

const colMeta = constructDetails(colCount);

const computeState = () =>
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
            ...task,
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
