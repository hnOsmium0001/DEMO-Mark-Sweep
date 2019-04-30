class Iteration {
}
Iteration.CONTINUE = 0;
Iteration.TERMINATE = 1;

/**
 * @param {number} min Inclusive minimum possible result.
 * @param {number} max Inclusive maximum possible result.
 */
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {number} trueWeight 
 * @param {number} falseWeight 
 */
function randomBoolean(trueWeight, falseWeight) {
  return random(1, trueWeight + falseWeight) <= trueWeight;
}

export { Iteration, random, randomBoolean };

