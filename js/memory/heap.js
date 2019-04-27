import { Fragments, Fragment } from './fragment.js';
import { Iteration } from '../iteration.js';

/** Unit in unknown state, created when the unit is being removed. */
const UNKNOWN = 0;
/** Free unit */
const FREE = 1;
/** Occupied, unmarked unit. */
const OCCUPIED = 2;
/** Occupied, marked unit and is safe from sweep. */
const OCCUPIED_SAFE = 3;
/** Occupied, marked unit but need to be sweeped. */
const OCCUPIED_DEAD = 4;

class MarkingFragments extends Fragments {
  /**
   * @param {Heap} heap 
   * @param {number} stateOnAdd 
   */
  constructor(heap, stateOnAdd) {
    super(heap.size);
    this.heap = heap;
    this.stateOnAdd = stateOnAdd;
  }

  remove(fragment) {
    // Partial check
    if (this.stateMap[fragment.begin] === this.stateOnAdd && this.stateMap[fragment.end] === this.stateOnAdd) { 
      this.stateMap.fill(UNKNOWN, fragment.begin, fragment.end);
      super.remove(fragment);
    }
  }

  insertFragmentAt(fragment, i) {
    // Partial check
    if (this.stateMap[fragment.begin] === UNKNOWN && this.stateMap[fragment.end] === UNKNOWN) { 
      this.stateMap.fill(this.stateOnAdd, fragment.begin, fragment.end);
      super.insertFragmentAt(fragment);
    }
  }

  clear() {
    this.stateMap.map(state => state === this.stateOnAdd ? UNKNOWN : state);
    super.clear();
  }

  /**
   * Get the stateMap property from the heap object bond.
   * @returns {number[]}
   * @private
   */
  get stateMap() {
    return this.heap.stateMap;
  }
}

class Heap {
  /**
   * @param {number} size Number of words
   */
  constructor(size) {
    this.size = size;
    this.fragmentsFree = new MarkingFragments(this, FREE);
    this.fragmentsFree.addRange(0, this.endIndex);
    this.fragmentsOccupied = new MarkingFragments(this, OCCUPIED);
    this.stateMap = [];
    this._gc = null;
    this.objects = [];
    // References to objects in 'this.objects'
    this.root = [];
  }

  /**
   * Alias to {@code this.root}.
   * @returns {Fragment[]}
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
        this.fragmentsOccupied.addAt(fragment.begin, size);
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
    if (result === -1) {
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

export { UNKNOWN, FREE, OCCUPIED, OCCUPIED_SAFE, OCCUPIED_DEAD, MarkingFragments, Heap };
