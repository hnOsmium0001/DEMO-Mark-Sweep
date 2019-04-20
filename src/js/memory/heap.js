import { Fragments } from './fragment';
import { Iteration } from '../iteration';

class Heap {
  constructor() {
    this.fragmentsFree = new Fragments();
    this.fragmentsOccupied = new Fragments();
    this.root = [];
  }

  /**
   * Alias to {@code this.root}.
   */
  get references() {
    return this.root;
  }

  addReference(ptr) {
    this.root.push(ptr);
  }

  clearReferences() {
    this.root = [];
  }

  /**
   * Finds a free fragment that fits an object with the given size, cut out extras if necessary, and mark the rest occupied.
   *
   * @return {number} Start of a fragment that fits an object that is given size. If allocation failed, it will return {@code -1}.
   */
  allocate(size) {
    let result = -1;

    this.fragmentsFree.iterate(fragment => {
      if (fragment.size >= size) {
        const unused = fragment.size - size;
        this.fragmentsFree.remove(fragment);
        this.fragmentsFree.addAt(fragment.start + size, unused);

        result = fragment.start;
        return Iteration.TERMINATE;
      }
      return Iteration.CONTINUE;
    });

    return result;
  }

  /**
   * @param {number} ptr Start of a fragment, in {@code this.fragmentsFree}.
   */
  free(ptr) {
    const fragment = this.fragmentsOccupied.startsAt(ptr);
    this.fragmentsOccupied.remove(fragment);
    this.fragmentsFree.add(fragment);
  }
}

export { Heap };
