import { colCount, emptyCol, maxTaskCount, swimlanesCount } from "./App/knob";
var randomWords = require('random-words');

const randomWord = (len = 5) => randomWords()

const constructDetail = () => ({ id: Math.random(), label: randomWord() })
const constructDetails = (count) => [...new Array(count)].map(constructDetail)

const colMeta = constructDetails(colCount);

export const computeState = () => constructDetails(swimlanesCount).reduce((preRow, swimlane, idx) => {
  const cols = colMeta.reduce((preCol, col) => {
    const taskCount = (idx + 1) % emptyCol ? Math.floor(Math.random() * maxTaskCount) : 0
    return {
      ...preCol,
      [col.id]: {
        ...col,
        count: taskCount,
        tasks: constructDetails(taskCount).map(task => ({ ...task, colId: col.id, swimlaneId: swimlane.id })),
      }
    }
  }, {})
  return {
    ...preRow,
    [swimlane.id]: {
      id: swimlane.id,
      label: swimlane.label,
      count: Object.values(cols).reduce((sum, col) => col.count + sum, 0),
      cols,
    }
  }
}, {})

// eslint-disable-next-line no-restricted-globals
self.onmessage = (e) => {
  const { action } = e.data
  if (action === 'COMPUTE') {
    const state = computeState();
    // eslint-disable-next-line no-restricted-globals
    self.postMessage({ state })
  }
}

console.log('test')