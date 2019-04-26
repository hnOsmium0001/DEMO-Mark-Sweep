import { VirtualObject } from './memory/objects';
import { Heap } from './memory/heap';
import { MarkSweep } from './memory/gc_algorithum';

const heap = new Heap(64);
heap.gc = new MarkSweep(heap);

const obj = VirtualObject.create(2, [], heap);
heap.addReference(obj);

console.log(heap.references);
console.log(heap.fragmentsOccupied.fragmentsStorage);
console.log(heap.fragmentsFree.fragmentsStorage);