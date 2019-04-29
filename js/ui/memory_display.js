import { MarkSweep } from "../memory/gc_algorithum.js";
import { Heap } from "../memory/heap.js";

const BASE_UNIT_SIZE = 64;
const SIZE_SHRINK_PERIOD = 128;

class MemoryDisplay {
  /**
   * @param {number} size 
   */
  constructor(size) {
    this.init(size);
  }

  /**
   * @param {number} size 
   */
  init(size) {
    this.heap = new Heap(size);
    this.heap.gc = new MarkSweep(this.heap);
    this.populateWordElements();
  }

  populateWordElements() {
    // Limit the number used for unitSize calculation so that it doesn't go crazyly tiny when heap size is larger
    const shrinkFactor = SIZE_SHRINK_PERIOD / Math.min(this.size, 1024);
    const unitSize = BASE_UNIT_SIZE * shrinkFactor;

    // Create a new CSS class to give units width and height
    $('head').append($('<style></style>').html(`.word-sizing { width: ${unitSize}px; height: ${unitSize}px; }`));

    const display = $('#memory-display').empty();
    for (let i = 0; i < this.size; ++i) {
      display.append($(`<div></div>`)
        .prop('id', `word-${i}`)
        .addClass('word')
        .addClass('word-sizing')
        // For some reason, .data() won't write properly, so we add an attribute instead, and let jQuery read from it when we invoke .data() in effects.js
        // Use .attr() instead of .prop() because our data attribute doesn't exist as a property
        .attr('data-index', i));
    }
  }

  get size() {
    return this.heap.size;
  }

  set size(size) {
    this.heap.size = size;
  }
}

export { MemoryDisplay };

