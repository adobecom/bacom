/**
 * Promise based setTimeout that can be await'd
 * @param {int} timeOut time out in milliseconds
 * @param {*} cb Callback function to call when time elapses
 * @returns
 */
const delay = (timeOut, cb) => new Promise((resolve) => {
  setTimeout(() => {
    resolve((cb && cb()) || null);
  }, timeOut);
});

export default delay;
