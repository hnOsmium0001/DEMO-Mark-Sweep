import { VirtualObject } from './memory/objects.js';
import { Heap } from './memory/heap.js';
import { MarkSweep } from './memory/gc_algorithum.js';

const heap = new Heap(64);
heap.gc = new MarkSweep(heap);

const obj_o1_1 = VirtualObject.create(2, [], heap); // 0
const obj_o1 = VirtualObject.create(3, [obj_o1_1], heap); // 1

const obj_o2_1 = VirtualObject.create(2, [obj_o2_2], heap); // 2
const obj_o2_2 = VirtualObject.create(2, [], heap); // 3
const obj_o2 = VirtualObject.create(6, [obj_o2_1, obj_o2_2], heap); // 4

const obj_o3 = VirtualObject.create(1, [obj, obj2], heap); // 5

const obj = VirtualObject.create(2, [obj_o1, obj_o2, obj_o3], heap); // 6
const obj2 = VirtualObject.create(4, [obj_o1, obj], heap); // 7
heap.addReference(obj);
heap.addReference(obj2);

// Loop referencing
const randomObj1 = VirtualObject.create(2, [], heap); // 8
const randomObj2 = VirtualObject.create(8, [randomObj1, obj_o1, obj], heap) // 9
randomObj1.ref.push(randomObj2);

const wildObj = VirtualObject.create(1, [], heap) // 10

console.log("Order: objects, occupied, free")
console.log(heap.objects);
console.log(heap.fragmentsOccupied.storage);
console.log(heap.fragmentsFree.storage);

heap.gc.collect();
console.log("GC");

console.log(heap.objects);
console.log(heap.fragmentsOccupied.storage);
console.log(heap.fragmentsFree.storage);