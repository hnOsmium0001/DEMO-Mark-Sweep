class Fragment {
  constructor(start, size) {
    this.start = start;
    this.size = size;
    this.end = start + size;
  }

  isBefore(other) {
    return this.start - 1 == other.end;
  }

  isAfter(other) {
    return this.end + 1 == other.start;
  }

  isNeighborWith(other) {
    return isBefore(other) || isAfter(other);
  }

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

  iterate(lambda) {
    // TODO
  }
}

export { Fragment, Fragments };
