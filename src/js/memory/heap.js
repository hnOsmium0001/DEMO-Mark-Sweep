import { Fragments } from './fragment';
import { Iteration } from '../iteration';

class Heap {
  constructor() {
    this.fragmentsFree = new Fragments();
    this.fragmentsOccupied = new Fragments();
    this._gc = null;
    this.objects = [];
    this.root = [];
  }

  /**
   * Alias to {@code this.root}.
   * @returns {Array}
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

    this.fragmentsFree.iterate(fragment => {
      if (fragment._size >= size) {
        const unused = fragment._size - size;
        this.fragmentsFree.remove(fragment);
        this.fragmentsFree.addAt(fragment._begin + size, unused);

        result = fragment._begin;
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
    const fragment = this.fragmentsOccupied.getStartsAt(ptr);
    this.fragmentsOccupied.remove(fragment);
    this.fragmentsFree.add(fragment);
  }

  sortFragments() {
    this.fragmentsFree.clear();

    let movingTarget = 0;
    this.fragmentsOccupied.iterate(fragment => {
      if (fragment._begin != movingTarget) {
        fragment._begin = movingTarget;
      }
    });
  }

  /**
   * @returns {number}
   */
  get gc() {
    return this._gc;
  }

  /**
   * @param {{ collect: any; }} gc
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
