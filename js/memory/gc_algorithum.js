import { Fragments } from './fragment.js';
import { VirtualObject } from './objects.js';
import { Heap } from './heap.js';

class MarkSweep {
  /**
   * @param {Heap} heap 
   */
  constructor(heap) {
    this.heap = heap;
  }

  mark() {
    if (this.marked) {
      throw `The heap ${this.heap} is already marked`;
    }

    this.heap.fragmentsFree.clear();
    this.heap.fragmentsOccupied.clear();
    new ObjectGraphIterator(this.heap.fragmentsOccupied).iterateObjectGraph(this.heap.references);

    this.marked = true;
  }

  sweep() {
    if (!this.marked) {
      throw `The heap ${this.heap} is not marked yet`;
    }

    // Head of the a potential free fragment, always moved to 'end + 1' of a occupied fragment
    // "potential" because there might be multiple consecitive occupied fragments
    let head = 0;
    this.heap.fragmentsOccupied.forEach(fragment => {
      if (head < fragment.begin) {
        this.heap.fragmentsFree.addRange(head, fragment.begin - 1);
      }
      head = fragment.end + 1;
    });

    this.marked = false;
  }

  collect() {
    this.mark();
    this.sweep();
  }
}

/**
 * Internal iterating utility object.
 * @private
 */
class ObjectGraphIterator {
  /**
   * @param {Fragments} fragmentsOccupied 
   */
  constructor(fragmentsOccupied) {
    this.fragmentsOccupied = fragmentsOccupied;
    this.visited = new Set();
  }

  /**
   * @param {VirtualObject[]} references 
   */
  iterateObjectGraph(references) {
    for (const object of references) {
      if (!this.visited.has(object)) {
        this.visited.add(object);
        this.fragmentsOccupied.addAt(object.begin, object.size);
        this.iterateObjectGraph(object.ref);
      }
    }
  }
}

export { MarkSweep };
