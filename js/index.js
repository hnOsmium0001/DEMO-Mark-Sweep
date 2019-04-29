import { Bindings } from './ui/behaviors.js';
import { MemoryDisplay } from './ui/memory_display.js';

$(document).ready(() => {
  const memoryDisplay = new MemoryDisplay(64);

  new Bindings(memoryDisplay).bindAll();

  // const heap = memoryDisplay.heap;

  // console.log("Order: objects, occupied, free");

  // console.log(heap.objects);
  // console.log(heap.fragmentsOccupied.storage);
  // console.log(heap.fragmentsFree.storage);

  // heap.gc.collect();
  // console.log("GC");

  // console.log(heap.objects);
  // console.log(heap.fragmentsOccupied.storage);
  // console.log(heap.fragmentsFree.storage);
});

