import { colCount, emptyCol, maxTaskCount, swimlanesCount } from "./App/knob";
var randomWords = require('random-words');

const randomWord = (len = 5) => randomWords()

const constructDetail = () => ({ id: Math.random(), label: randomWord() })
const constructDetails = (count) => [...new Array(count)].map(constructDetail)

const colMeta = constructDetails(colCount);

export const computeState = () => constructDetails(swimlanesCount).reduce((preRow, row, idx) => {
  const cols = colMeta.reduce((preCol, col) => {
    const taskCount = (idx + 1) % emptyCol ? Math.floor(Math.random() * maxTaskCount) : 0
    return {
      ...preCol,
      [col.id]: {
        ...col,
        count: taskCount,
        tasks: constructDetails(taskCount).map(task => ({ ...task, colId: col.id, rowId: row.id })),
      }
    }
  }, {})
  return {
    ...preRow,
    [row.id]: {
      id: row.id,
      label: row.label,
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