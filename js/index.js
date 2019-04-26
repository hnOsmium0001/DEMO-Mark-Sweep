import { VirtualObject } from './memory/objects.js';
import { Heap } from './memory/heap.js';
import { MarkSweep } from './memory/gc_algorithum.js';

const heap = new Heap(64);
heap.gc = new MarkSweep(heap);

const obj_o1_1 = VirtualObject.create(2, [5], heap); // 0
const obj_o1 = VirtualObject.create(3, [0], heap); // 1

const obj_o2_1 = VirtualObject.create(2, [4, 3], heap); // 2
const obj_o2_2 = VirtualObject.create(2, [], heap); // 3
const obj_o2 = VirtualObject.create(6, [2, 3], heap); // 4

const obj_o3 = VirtualObject.create(1, [6, 7], heap); // 5

const obj = VirtualObject.create(2, [1, 2, 5], heap); // 6
const obj2 = VirtualObject.create(4, [1, 6], heap); // 7
heap.addReference(obj);
heap.addReference(obj2);

const randomObj1 = VirtualObject.create(2, [9], heap); // 8
const randomObj2 = VirtualObject.create(8, [8, 1, 6], heap) // 9

const selfObj = VirtualObject.create(1, [10], heap) // 10

console.log("Order: objects, occupied, free")
console.log(heap.objects);
console.log(heap.fragmentsOccupied.storage);
console.log(heap.fragmentsFree.storage);

heap.gc.collect();
console.log("GC");

console.log(heap.objects);
console.log(heap.fragmentsOccupied.storage);
console.log(heap.fragmentsFree.storage);