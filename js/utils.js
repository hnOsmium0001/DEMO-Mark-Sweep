class Iteration {
}
Iteration.CONTINUE = 0;
Iteration.TERMINATE = 1;

/**
 * @param {number} min Inclusive minimum possible result.
 * @param {*} max Inclusive maximum possible result.
 */
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { Iteration, random };

