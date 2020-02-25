import { random, randomBoolean } from './utils';
import { Heap } from './heap';

export class VirtualObject {
  static create(
    size: number,
    ref: VirtualObject[],
    heap: Heap,
    throwErrors: boolean = true
  ): VirtualObject {
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

  public ptr: number;
  public begin: number;
  public end: number;
  public size: number;
  public ref: VirtualObject[];

  /**
   * @param {number} ptr Index in 'heap.objects', -1 if it is not in a heap yet
   * @param {number} begin Beginning word of this object
   * @param {number} size Size in words of this object
   * @param {VirtualObject[]} ref References stored (pointing to them)
   */
  constructor(
    ptr: number,
    begin: number,
    size: number,
    ref: VirtualObject[]
  ) {
    this.ptr = ptr;
    this.begin = begin;
    this.size = size;
    this.end = begin + size - 1;
    this.ref = ref;
  }
}


const MIN_OBJECT_SIZE = 2;
const MAX_OBJECT_SIZE = 10;

function generateObjects(heap: Heap, objects: VirtualObject[]): void {
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

function generateReferences(objects: VirtualObject[]): void {
  // Make some objects dead (unreachable)
  const deadObjects = objects.filter(object => randomBoolean(DEAD_OBJECTS_WEIGHT, ALIVE_OBJECTS_WEIGHT));
  // Choose all objects that are not dead
  const referableObjects = objects.filter(object => deadObjects.indexOf(object) == -1);

  // Generate references for all objects, even those who are determined as dead
  // The dead ones will refer to other objects, however no body will refer to them
  for (const object of objects) {
    const amountToGenerate = Math.min(random(0, MAX_AMOUNT_OBJECT_REFERENCES), referableObjects.length);
    const selected = new Set<VirtualObject>();

    for (let i = 0; i < amountToGenerate; ++i) {
      const idx = random(0, referableObjects.length - 1);
      if (selected.has(referableObjects[idx])) {
        // Redo loop
        --i;
        continue;
      }
      selected.add(referableObjects[idx]);
    }

    object.ref = [...selected];
  }
}

const MAX_AMOUNT_ROOTS = 3;

function generateRoots(heap: Heap, objects: VirtualObject[]): void {
  // In case of this algorithum being executed when heap isn't empty, is allows adding root reference work correctly
  const initialAmountRoots = heap.root.length;
  const amountRoots = Math.min(random(1, MAX_AMOUNT_ROOTS), objects.length);
  while (heap.root.length - initialAmountRoots < amountRoots) {
    heap.addReference(objects[random(0, objects.length - 1)]);
  }
}

export function regenerateObjects(heap: Heap) {
  const objects: VirtualObject[] = [];
  generateObjects(heap, objects);
  generateReferences(objects);
  generateRoots(heap, objects);
}
