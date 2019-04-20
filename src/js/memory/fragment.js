class Fragment {
  /**
   * @param {number} start 
   * @param {number} size 
   */
  constructor(start, size) {
    this.start = start;
    this.size = size;
    this.end = start + size;
  }

  /**
   * @param {Fragment} other 
   * @returns {boolean}
   */
  isBefore(other) {
    return this.start - 1 == other.end;
  }

  /**
   * @param {Fragment} other 
   * @returns {boolean}
   */
  isAfter(other) {
    return this.end + 1 == other.start;
  }

  /**
   * @param {Fragment} other 
   * @returns {boolean}
   */
  isNeighborWith(other) {
    return isBefore(other) || isAfter(other);
  }

  /**
   * @param {Fragment} other 
   * @returns {Fragment} Always {@code this}.
   * @throws {Error} When this fragment and the other fragment is not neighbors.
   */
  merge(other) {
    if (isBefore(other)) {
      this.expandCapacity(other.size);
      this.end = other.end;
    } else if (isAfter(other)) {
      this.expandCapacity(other.size);
      this.start = other.start;
    } else {
      throw "Cannot merge two fragments that is not together";
    }
    // If the two fragments are not neighbors, it will not reach this statement as 'throw' exits the function
    return this;
  }

  /**
   * @param {number} increase 
   * @private
   */
  expandCapacity(increase) {
    this.size = this.size + increase;
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
}

export { Fragment, Fragments };
