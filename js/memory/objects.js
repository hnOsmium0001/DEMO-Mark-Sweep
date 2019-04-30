import { random, randomBoolean } from "../utils.js";
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


const MIN_OBJECT_SIZE = 2;
const MAX_OBJECT_SIZE = 10;

/**
 * @param {Heap} heap 
 * @param {VirtualObject[]} objects 
 */
function generateObjects(heap, objects) {
  // Between 1/2 and 2/3 of the heap
  let amountToFill = random(heap.size * (1 / 2), heap.size * (2 / 3));
  while (amountToFill > 0) {
    const objectSize = Math.min(random(MIN_OBJECT_SIZE, MAX_OBJECT_SIZE), amountToFill);
    // We will add references later
    const object = VirtualObject.create(objectSize, [], heap, false);
    // Unable to allocate enough space for the object, which means the heap is almost full
    // because our limit is far off the filling it to full.
    if (!object) {
      console.log('Unable to allocare enough space for the object, stopped object generation algorithum')
      break;
    }

    objects.push(object);
    amountToFill -= objectSize;
  }
}

const MAX_AMOUNT_OBJECT_REFERENCES = 6;
const DEAD_OBJECTS_WEIGHT = 3;
const ALIVE_OBJECTS_WEIGHT = 5;

/**
 * @param {VirtualObject[]} objects 
 */
function generateReferences(objects) {
  // Make some objects dead (unreachable)
  const deadObjects = objects.filter(object => randomBoolean(DEAD_OBJECTS_WEIGHT, ALIVE_OBJECTS_WEIGHT));
  // Choose all objects that are not dead
  const referableObjects = objects.filter(object => !deadObjects.includes(object));

  // Generate references for all objects, even those who are determined as dead
  // The dead ones will refer to other objects, however no body will refer to them
  for (const object of objects) {
    const amountToGenerate = Math.min(random(0, MAX_AMOUNT_OBJECT_REFERENCES), referableObjects.length);
    const selected = new Set();

    for (let i = 0; i < amountToGenerate; ++i) {
      const referenceIndex = random(0, referableObjects.length - 1);
      if (selected.has(referenceIndex)) {
        // Redo loop
        --i;
        continue;
      }
      selected.add(referableObjects[referenceIndex]);
    }

    object.ref = [...selected];
  }
}

const MAX_AMOUNT_ROOTS = 3;

/**
 * @param {Heap} heap 
 * @param {VirtualObject[]} objects 
 */
function generateRoots(heap, objects) {
  // In case of this algorithum being executed when heap isn't empty, is allows adding root reference work correctly
  const initialAmountRoots = heap.root.length;
  const amountRoots = Math.min(random(1, MAX_AMOUNT_ROOTS), objects.length);
  while (heap.root.length - initialAmountRoots < amountRoots) {
    heap.addReference(objects[random(0, objects.length - 1)]);
  }
}

/**
 * @param {Heap} heap 
 */
function regenerateObjects(heap) {
  const objects = [];
  generateObjects(heap, objects);
  generateReferences(objects);
  generateRoots(heap, objects);
}

export { VirtualObject, regenerateObjects };

