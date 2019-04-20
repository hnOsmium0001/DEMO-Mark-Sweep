import { Fragment, Fragments } from 'fragment';
import { Heap } from 'heap';

/**
 * A VirtualObject
 */
class VirtualObject {
  static create(size, ref, heap) {
    const start = heap.allocate(size);
    return new VirtualObject(start, size, ref);
  }

  constructor(start, size, ref) {
    this.start = start;
    this.size = size;
    this.end = start + size;
    this.ref = ref;
  }
}

export { VirtualObject };
