import { Heap } from './heap';

/**
 * A VirtualObject
 */
class VirtualObject {
  /**
   * @param {number} size 
   * @param {Array} ref 
   * @param {Heap} heap 
   * @returns {VirtualObject}
   */
  static create(size, ref, heap) {
    const ptr = heap.allocate(size);
    if (ptr == -1) {
      throw `Unable to allocate enough space for the given object: size=${size}`;
    }
    return new VirtualObject(ptr, size, ref);
  }

  /**
   * @param {number} ptr 
   * @param {number} size 
   * @param {Array} ref 
   */
  constructor(ptr, size, ref) {
    this.ptr = ptr;
    this.size = size;
    this.end = ptr + size;
    this.ref = ref;
  }
}

export { VirtualObject };
