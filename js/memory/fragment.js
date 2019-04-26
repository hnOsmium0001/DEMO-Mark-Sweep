import { Iteration } from "../iteration.js";

class Fragment {
  /**
   * @param {number} begin 
   * @param {number} size 
   */
  constructor(begin, size) {
    this._begin = begin;
    this._size = size;
    this._end = begin + size;
  }

  /**
   * @param {Fragment} other 
   * @returns {boolean}
   */
  isBefore(other) {
    return this._begin - 1 == other._end;
  }

  /**
   * @param {Fragment} other 
   * @returns {boolean}
   */
  isAfter(other) {
    return this._end + 1 == other._begin;
  }

  /**
   * @param {Fragment} other 
   * @returns {boolean}
   */
  isNeighborWith(other) {
    return this.isBefore(other) || this.isAfter(other);
  }

  /**
   * @param {Fragment} other 
   * @returns {Fragment} Always {@code this}.
   * @throws {Error} When this fragment and the other fragment is not neighbors.
   */
  merge(other) {
    if (this.isBefore(_other)) {
      this.expandCapacity(other._size);
      this._end = other._end;
    } else if (this.isAfter(other)) {
      this.expandCapacity(other._size);
      this._begin = other._begin;
    } else {
      throw 'Cannot merge two fragments that are not neighbors';
    }
    // If the two fragments are not neighbors, it will not reach this statement as 'throw' exits the function
    return this;
  }

  /**
   * @param {number} increase 
   * @private
   */
  expandCapacity(increase) {
    this.size += increase;
  }

  /**
   * @returns {number}
   */
  get begin() {
    return this._begin;
  }

  /**
   * @param {number} begin
   */
  set begin(begin) {
    this._begin = begin;
    this._end = begin + this._size;
  }

  /**
   * @returns {number}
   */
  get end() {
    return this._end;
  }

  /**
   * @param {number} end
   */
  set end(end) {
    this._end = end;
    this._size = end - this._begin;
  }

  /**
   * @returns {number}
   */
  get size() {
    return this._size;
  }

  /**
   * @param {number} size
   */
  set size(size) {
    this._size = size;
    this._end = this._begin + this._size;
  }
}

/**
 * @param {Fragments} fragments 
 * @param {(this: Fragment[], current: Fragment, next: Fragment) => boolean} predicate 
 * @returns {number}
 */
function findIndex(fragments, predicate) {
  if (predicate(fragments.fragmentBefore0, fragments.firstFragment)) {
    // If the new fragment fits before the first stored fragment, put it at i=0
    return 0;
  }

  // Access the storage array directly for performance, as this part is safe with any length of 'fragments.storage'
  const array = fragments.storage;
  const length = array.length - 1;
  // Don't iterate the last element
  for (let i = 0; i < length; ++i) {
    const current = array[i];
    // Since we will stop at 'length - 2' (second to last element), this is safe
    const next = array[i + 1];
    if(predicate(current, next)) {
      // If the new fragment fits between the 2 fragments, put it at the second fragment
      return i + 1;
    }
  }

  if (predicate(fragments.lastFragment, fragments.fragmentAfterEnd)) {
    // If the new fragment fits after all stored fragments, put it at end of the array (as 'array.push(fragment)')
    return array.length;
  }

  return -1;
}

// This fragment reference could be the same for all Fragments's
const _fragmentBefore0 = new Fragment(-1, 0);

// TODO use a better way to store fragments
class Fragments {
  constructor(heap) {
    this.storage = [];
    this.fragmentBefore0 = _fragmentBefore0;
    this.fragmentAfterEnd = new Fragment(heap.size, 0);
  }

  /**
   * @param {Fragment} fragment 
   * @returns {boolean}
   */
  remove(fragment) {
    const targetIndex = this.storage.indexOf(fragment);
    if (targetIndex != -1) {
      // Delete the fragment at 'targetIndex'
      this.storage.splice(targetIndex, 1);
      return true;
    }
    return false;
  }

  /**
   * @param {Fragment} fragment 
   * @param {number} i 
   * @returns {boolean}
   */
  spliceFragmentAt(fragment, i) {
    if (i != -1) {
      // Insert 'fragment' into 'this.fragmentStorage' at 'insertion'
      this.storage.splice(i, 0, fragment);
      return true;
    }
    return false;
  }

  /**
   * @param {Fragment} fragment 
   * @returns {boolean}
   */
  add(fragment) {
    const insertion = findIndex(this,
      (current, next) => current.end < fragment.begin && next.begin > fragment.end);
    return this.spliceFragmentAt(fragment, insertion);
  }

  /**
   * @param {number} begin 
   * @param {number} size 
   * @returns {boolean}
   */
  addAt(begin, size) {
    return this.addRange(begin, begin + size);
  }

  /**
   * @param {number} begin 
   * @param {number} size 
   * @returns {boolean}
   */
  addRange(begin, end) {
    const insertion = findIndex(this,
      (current, next) => current.end < begin && next.begin > end);
    return this.spliceFragmentAt(new Fragment(begin, end - begin), insertion);
  }

  clear() {
    this.storage = [];
  }

  /**
   * @param {(fragment: Fragment) => void} lambda 
   */
  forEach(lambda) {
    for (const fragment of this.storage) {
      switch (lambda(fragment)) {
        case Iteration.CONTINUE: break;
        case Iteration.TERMINATE: return;
      }
    }
  }

  /**
   * @param {number} ptr 
   * @returns {Fragment, undefined} 'undefined' when no such fragment is found
   */
  getBeginsAt(ptr) {
    return this.storage.find(fragment => fragment.begin == ptr);
  }

  /**
   * @param {number} i
   * @private
   */
  getInternal(i) {
    if (i < 0) {
      return this.fragmentBefore0;
    }
    if (i >= this.storage.length) {
      return this.fragmentAfterEnd;
    }
    return this.storage[i];
  }

  /**
   * @returns {Fragment}
   */
  get firstFragment() {
    // First element, 'fragmentAfterEnd' when 'storage' is empty
    return this.getInternal(0);
  }

  /**
   * @returns {Fragment}
   */
  get lastFragment() {
    // Last element, 'fragmentBefore0' when 'storage' is empty
    return this.getInternal(this.storage.length - 1);
  }
}

export { Fragment, Fragments };
