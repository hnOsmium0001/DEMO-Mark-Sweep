import { ObservableArray } from "./array.js";
import { Fragment, Fragments } from './memory/fragment.js';
import { VirtualObject } from './memory/objects.js';
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

/**
 * @param {Fragments} fragments 
 * @param {number} ptr 
 * @returns {Fragment}
 */
function findFragmentCovers(fragments, ptr) {
  let result = null;
  fragments.forEach(fragment => {
    if (fragment.begin <= ptr && fragment.end >= ptr) {
      result = fragment;
      return Iteration.TERMINATE;
    }
    return Iteration.CONTINUE;
  });
  return result;
}

/**
 * @param {ObservableArray} objects 
 * @param {number} ptr 
 * @returns {VirtualObject}
 */
function findObjectCovers(objects, ptr) {
  for (const object of objects) {
    if (object.begin <= ptr && object.end >= ptr) {
      return object;
    }
  }
  return null;
}

export { Iteration, random, randomBoolean, findFragmentCovers, findObjectCovers };

