import { Fragments } from './fragment.js';
import { Iteration } from '../iteration.js';

class Heap {
  /**
   * @param {number} size Number of words
   */
  constructor(size) {
    this.size = size;
    this.fragmentsFree = new Fragments(this);
    this.fragmentsOccupied = new Fragments(this);
    this._gc = null;
    this.objects = [];
    // References in an array
    this.root = [];
  }

  /**
   * Alias to {@code this.root}.
   * @returns {number[]}
   */
  get references() {
    return this.root;
  }

  /**
   * @param {number} ptr 
   */
  addReference(ptr) {
    this.root.push(ptr);
  }

  clearReferences() {
    this.root = [];
  }

  /**
   * Finds a free fragment that fits an object with the given size, cut out extras if necessary, and mark the rest occupied.
   *
   * @param {number} size 
   * @returns {number} Start of a fragment that fits an object that is given size. If allocation failed, it will return {@constant -1}.
   */
  allocatePure(size) {
    let result = -1;

    this.fragmentsFree.forEach(fragment => {
      if (fragment.size >= size) {
        const unused = fragment.size - size;
        this.fragmentsFree.remove(fragment);
        this.fragmentsFree.addAt(fragment.begin + size, unused);

        result = fragment.begin;
        return Iteration.TERMINATE;
      }
      return Iteration.CONTINUE;
    });

    return result;
  }

  /**
   * Finds a free fragment that fits an object with the given size, cut out extras if necessary, and mark the rest occupied.
   * If it was unable to find such fragment, it will try to rearrange all the occupied fragments so that they're all in a big chunk.
   * 
   * @param {number} size 
   * @returns {number} Start of a fragment that fits an object that is given size. If allocation failed, it will return {@constant -1}.
   * @see #allocatePure(number)
   * @see #sortFragments()
   */
  allocate(size) {
    const result = this.allocatePure(size);
    if (result == -1) {
      this.sortFragments();
      return this.allocatePure(size);
    }
    return result;
  }

  /**
   * @param {number} ptr Start of a fragment, in {@code this.fragmentsFree}.
   */
  free(ptr) {
    const fragment = this.fragmentsOccupied.getBeginsAt(ptr);
    this.fragmentsOccupied.remove(fragment);
    this.fragmentsFree.add(fragment);
  }

  sortFragments() {
    this.fragmentsFree.clear();

    let movingTarget = 0;
    this.fragmentsOccupied.forEach(fragment => {
      if (fragment.begin != movingTarget) {
        fragment.begin = movingTarget;
      }
      movingTarget = fragment.end + 1;
      return Iteration.CONTINUE;
    });

    this.fragmentsFree.addRange(movingTarget, this.endIndex - movingTarget);
  }

  /**
   * @returns {number}
   */
  get endIndex() {
    return this.size - 1;
  }

  /**
   * @returns {number}
   */
  get gc() {
    return this._gc;
  }

  /**
   * @param {{ collect: function; }} gc
   */
  set gc(gc) {
    if (typeof gc.collect === 'function') {
      this._gc = gc;
    } else {
      throw 'Cannot register a GC algorithum that is disfunctional (missing method "collect()")';
    }
  }
}

export { Heap };
