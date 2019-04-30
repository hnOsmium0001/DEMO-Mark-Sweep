import { Bindings } from './ui/behaviors.js';
import { MemoryDisplay } from './ui/memory_display.js';

$(document).ready(() => {
  const memoryDisplay = new MemoryDisplay(parseInt($('#heap-size').val()));

  // Set the size of overlay canvas based on the size of dispaly element
  const display = $('#memory-display');
  const ctx = $('#memory-overlay')[0].getContext('2d');
  // Use .outerWidth() to include the padding
  ctx.canvas.width = display.outerWidth();
  ctx.canvas.width = display.outerHeight();

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

