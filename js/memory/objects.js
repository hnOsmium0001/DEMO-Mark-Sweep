import { Heap } from './heap.js';

/**
 * A VirtualObject
 */
class VirtualObject {
  /**
   * @param {number} size 
   * @param {Array} ref 
   * @param {Heap} heap 
   * @param {boolean} [throwErrors = true]
   * @returns {VirtualObject}
   */
  static create(size, ref, heap, throwErrors = true) {
    const allocedBegin = heap.allocate(size);
    if (allocedBegin == -1) {
      if (throwErrors) {
        throw `Unable to allocate enough space for the given object: size=${size}`;
      } else {
        return null;
      }
    }

    const object = new VirtualObject(heap.objects.length, allocedBegin, size, ref);
    heap.objects.push(object)
    return object;
  }

  /**
   * @param {number} ptr Index in 'heap.objects', -1 if it is not in a heap yet
   * @param {number} begin Beginning word of this object
   * @param {number} size Size in words of this object
   * @param {VirtualObject[]} ref References stored (pointing to them)
   */
  constructor(ptr, begin, size, ref) {
    this.ptr = ptr;
    this.begin = begin;
    this.size = size;
    this.end = begin + size - 1;
    this.ref = ref;
  }
}

export { VirtualObject };

