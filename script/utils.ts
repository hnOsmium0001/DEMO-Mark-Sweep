import { Fragments, Fragment } from './fragment';
import { VirtualObject } from './objects';

export const Iteration = {
  CONTINUE: 0,
  TERMINATE: 1,
};

/**
 * @param {number} min Inclusive minimum possible result.
 * @param {number} max Inclusive maximum possible result.
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomBoolean(trueWeight: number, falseWeight: number): boolean {
  return random(1, trueWeight + falseWeight) <= trueWeight;
}

export function findFragmentCovers(fragments: Fragments, ptr: number): Fragment {
  let result = null;
  fragments.forEach((fragment: { begin: number; end: number; }) => {
    if (fragment.begin <= ptr && fragment.end >= ptr) {
      result = fragment;
      return Iteration.TERMINATE;
    }
    return Iteration.CONTINUE;
  });
  return result;
}

export function findObjectCovers(objects: VirtualObject[], ptr: number): VirtualObject {
  for (const object of objects) {
    if (object.begin <= ptr && object.end >= ptr) {
      return object;
    }
  }
  return null;
}
