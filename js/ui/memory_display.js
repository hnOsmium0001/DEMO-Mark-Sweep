import { MarkSweep } from "../memory/gc_algorithum.js";
import { Heap } from "../memory/heap.js";

const BASE_UNIT_SIZE = 64;
const SIZE_SHRINK_PERIOD = 8;

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

  /**
   * @param {number} size 
   */
  populateWordElements() {
    const sideLength = Math.sqrt(this.size);
    if (!Number.isInteger(sideLength)) {
      throw "Unable to display a heap with size that is not a perfect square";
    }

    const shrinkFactor = 1 / Math.ceil(sideLength / SIZE_SHRINK_PERIOD);
    const unitSize = BASE_UNIT_SIZE * shrinkFactor;

    // We don't really care about where this class go in the style sheet, and which style sheet it goes to,
    // assuming we have a style sheet (which is the case)
    // Unfortunately vanilla jQuery doesn't support modifying CSS Stylesheets directly
    document.styleSheets[0].addRule('.word-sizing', `width: ${unitSize}px; height: ${unitSize}px;`, 1);

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

