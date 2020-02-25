import { Iteration } from './utils';

export class Fragment {
  private _begin: number;
  private _size: number;
  private _end: number;

  constructor(begin: number, size: number) {
    this._begin = begin;
    this._size = size;
    this._end = begin + size - 1;
  }

  public isBefore(other: Fragment): boolean {
    return this._begin - 1 == other._end;
  }

  public isAfter(other: Fragment): boolean {
    return this._end + 1 == other._begin;
  }

  public isNeighborWith(other: Fragment): boolean {
    return this.isBefore(other) || this.isAfter(other);
  }

  /**
   * @param {Fragment} other 
   * @returns {Fragment} Always {@code this}.
   * @throws {Error} When this fragment and the other fragment is not neighbors.
   */
  public merge(other: Fragment): Fragment {
    if (this.isBefore(other)) {
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

  private expandCapacity(increase: number): void {
    this._size += increase;
  }

  get begin() {
    return this._begin;
  }

  set begin(begin) {
    this._begin = begin;
    this._end = begin + this._size;
  }

  get end() {
    return this._end;
  }

  set end(end) {
    this._end = end;
    this._size = end - this._begin + 1;
  }

  get size() {
    return this._size;
  }

  set size(size) {
    this._size = size;
    this._end = this._begin + this._size - 1;
  }
}

function findIndex(
  fragments: Fragments,
  predicate: (this: Fragment[], current: Fragment, next: Fragment) => boolean
): number {
  if (predicate.call(fragments.storage, fragments.fragmentBefore0, fragments.firstFragment)) {
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
    if(predicate.call(fragments.storage, current, next)) {
      // If the new fragment fits between the 2 fragments, put it at the second fragment
      return i + 1;
    }
  }

  if (predicate.call(fragments.storage, fragments.lastFragment, fragments.fragmentAfterEnd)) {
    // If the new fragment fits after all stored fragments, put it at end of the array (as 'array.push(fragment)')
    return array.length;
  }

  return -1;
}

// This fragment reference could be the same for all Fragments's
const _fragmentBefore0 = new Fragment(-1, 0);

// TODO use a better way to store fragments
export class Fragments {
  public storage: Fragment[];
  public fragmentBefore0: Fragment;
  public fragmentAfterEnd: Fragment;

  /**
  * @param {number} size Number of words, should be the same as the heap it belongs to if it has one.
  */
  constructor(size: number) {
    this.storage = [];
    this.fragmentBefore0 = _fragmentBefore0;
    this.fragmentAfterEnd = new Fragment(size, 0);
  }

  public remove(fragment: Fragment): boolean {
    const targetIndex = this.storage.indexOf(fragment);
    if (targetIndex != -1) {
      // Delete the fragment at 'targetIndex'
      this.storage.splice(targetIndex, 1);
      return true;
    }
    return false;
  }

  protected insertFragmentAt(fragment: Fragment, i: number): boolean {
    if (i != -1) {
      const previous = this.getInternal(i - 1);
      if (fragment.isAfter(previous)) {
        previous.merge(fragment);
        return true;
      }

      const following = this.getInternal(i + 1);
      if (fragment.isBefore(following)) {
        following.merge(fragment);
        return true;
      }

      // Insert 'fragment' into 'this.fragmentStorage' at 'i'
      this.storage.splice(i, 0, fragment);
      return true;
    }
    return false;
  }

  public add(fragment: Fragment): boolean {
    const insertion = findIndex(this,
      (current, next) => current.end < fragment.begin && next.begin > fragment.end);
    return this.insertFragmentAt(fragment, insertion);
  }

  public addAt(begin: number, size: number): boolean {
    if (size === 0) {
      return;
    }
    return this.addRangeInternal(begin, size, begin + size - 1);
  }

  public addRange(begin: number, end: number): boolean {
    return this.addRangeInternal(begin, end - begin + 1, end);
  }

  private addRangeInternal(begin: number, size: number, end: number): boolean {
    const insertion = findIndex(this,
      (current, next) => current.end < begin && next.begin > end);
    return this.insertFragmentAt(new Fragment(begin, size), insertion);
  }

  public clear(): void {
    this.storage.length = 0;
  }

  public forEach(
    lambda: (fragment: Fragment) => number
  ): void {
    for (const fragment of this.storage) {
      const signal = lambda(fragment);
      switch (signal) {
        case Iteration.CONTINUE: break;
        case Iteration.TERMINATE: return;
        default: throw `Unknown signal received: ${signal}`;
      }
    }
  }

  /**
   * @param {number} ptr 
   * @returns {Fragment, undefined} 'undefined' when no such fragment is found
   */
  public getBeginsAt(ptr: number): Fragment {
    return this.storage.find(fragment => fragment.begin == ptr);
  }

  private getInternal(i: number): Fragment {
    if (i < 0) {
      return this.fragmentBefore0;
    }
    if (i >= this.storage.length) {
      return this.fragmentAfterEnd;
    }
    return this.storage[i];
  }

  get firstFragment() {
    // First element, 'fragmentAfterEnd' when 'storage' is empty
    return this.getInternal(0);
  }

  get lastFragment() {
    // Last element, 'fragmentBefore0' when 'storage' is empty
    return this.getInternal(this.storage.length - 1);
  }
}
