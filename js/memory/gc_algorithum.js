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
      return;
    }

    this.heap.fragmentsFree.clear();
    this.heap.fragmentsOccupied.clear();
    new ObjectGraphIterator(this.heap.fragmentsOccupied, this.heap.objects).iterateObjectGraph(this.heap.references);

    this.marked = true;
  }

  sweep() {
    if (!this.marked) {
      return;
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
   * @param {VirtualObject[]} objects 
   * @param {Fragments} fragmentsOccupied 
   */
  constructor(objects, fragmentsOccupied) {
    this.objects = objects;
    this.fragmentsOccupied = fragmentsOccupied;
    this.visited = new Set();
  }

  /**
   * @param {number[]} references 
   */
  iterateObjectGraph(references) {
    for (const ptr of references) {
      if (!this.visited.has(ptr)) {
        const object = this.objects[ptr];
        this.visited.add(ptr);
        this.fragmentsOccupied.addAt(object.begin, object.size);
        this.iterateObjectGraph(object.ref);
      }
    }
  }
}

export { MarkSweep };
