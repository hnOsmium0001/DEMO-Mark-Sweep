import { Heap } from './heap.js';

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
   * @param {number} begin Beginning word of this object
   * @param {number} size Size in words of this object
   * @param {Array} ref References stored (pointing to them)
   */
  constructor(begin, size, ref) {
    this.begin = begin;
    this.size = size;
    this.end = begin + size;
    this.ref = ref;
  }
}

export { VirtualObject };
