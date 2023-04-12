export const getList = (count: number, name = "sample") => {
  return Array(count)
    .fill(undefined)
    .map((_, idx) => {
      return {
        id: idx,
        name: name + idx,
        size: idx > 5 ? "xl" : "",
        isDrag: false,
      };
    });
};

function throttle(callback: (args: string) => any, limit: number) {
  var wait = false; // Initially, we're not waiting
  return function (args: string) {
    // We return a throttled function
    if (!wait) {
      // If we're not waiting
      callback(args); // Execute users function
      wait = true; // Prevent future invocations
      setTimeout(function () {
        // After a period of time
        wait = false; // And allow future invocations
      }, limit);
    }
  };
}

export const log = throttle((msg) => console.log(msg), 100);

export function debounce<R extends unknown>(fn: (...args: any[]) => R, delay: number) {
  let timer: number = 0;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}
