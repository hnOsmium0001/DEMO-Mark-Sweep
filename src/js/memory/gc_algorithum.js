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
    new ObjectGraphIterator(this.heap.fragmentsOccupied, this.heap.objects).iterateObjectGraph();

    this.marked = true;
  }

  sweep() {
    if (!this.marked) {
      return;
    }

    // Shorter name (alias) for this.heap as it is used a lot of times
    const heap = this.heap;
    // Head of the a potential free fragment, always moved to 'end + 1' of a occupied fragment
    // "potential" because there might be multiple consecitive occupied fragments
    let head = 0;
    heap.fragmentsOccupied.iterate(fragment => {
      if (head < fragment.start) {
        heap.fragmentsFree.addRange(head, fragment.start - 1);
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
    for (ptr in references) {
      if (!this.visited.contains(ptr)) {
        const object = this.objects[ptr];
        this.visited.add(ptr);
        this.fragmentsOccupied.addAt(object.start, object.size);
        iterateObjectGraph(object.ref);
      }
    }
  }
}

export { MarkSweep };
