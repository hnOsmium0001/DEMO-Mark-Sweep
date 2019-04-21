class Fragment {
  /**
   * @param {number} start 
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
    this._size = end - this._start;
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

class Fragments {
  constructor() {
    // TODO store fragments in order somehow
  }

  remove(fragment) {
    // TODO
  }

  add(fragment) {
    // TODO
  }

  addAt(start, size) {
    // TODO
  }

  addRange(start, end) {
    // TODO
  }

  clear() {
    // TODO
  }

  iterate(lambda) {
    // TODO
  }

  getStartsAt(ptr) {
    // TODO
  }
}

export { Fragment, Fragments };
