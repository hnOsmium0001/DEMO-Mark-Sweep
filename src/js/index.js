import { VirtualObject } from './memory/objects';
import { Heap } from './memory/heap';

const heap = new Heap();
const obj = new VirtualObject(0, 8, []);