import { VirtualObject } from './memory/objects.js';
import { Heap } from './memory/heap.js';
import { MarkSweep } from './memory/gc_algorithum.js';

const heap = new Heap(64);
heap.gc = new MarkSweep(heap);

const obj = VirtualObject.create(2, [], heap);
heap.addReference(obj);

console.log(heap.references);
console.log(heap.fragmentsOccupied.fragmentsStorage);
console.log(heap.fragmentsFree.fragmentsStorage);