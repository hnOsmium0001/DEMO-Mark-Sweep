import { Heap } from "../memory/heap.js";
import { MarkSweep } from "../memory/gc_algorithum.js";

// const MAX_DISPLAY_SIZE = 640;
// const DISPLAY_PADDING = 4;
// const DISPLAY_BORDER = 1;

const BASE_UNIT_SIZE = 64;
const SIZE_SHRINK_PERIOD = 8;

/** Unit only has margin on the left and the bottom, so couting them once is enought */
const UNIT_MARGIN = 4;
const UNIT_BORDER = 1;

class MemoryDisplay {
  /**
   * @param {number} size 
   */
  constructor(size) {
    this.heap = new Heap(size);
    this.heap.gc = new MarkSweep(this.heap);
  }

  init() {
    const sideLength = Math.sqrt(this.heap.size);
    if (!Number.isInteger(sideLength)) {
      throw "Unable to display a heap with size that is not a perfect square";
    }

    const shrinkFactor = 1 / Math.ceil(sideLength / SIZE_SHRINK_PERIOD);
    const unitSize = BASE_UNIT_SIZE * shrinkFactor;

    // We don't really care about where this class go in the style sheet, and which style sheet it goes to
    // assuming we have a style sheet (which is the case)
    document.styleSheets[0].addRule('.word-size', `width: ${unitSize}; height: ${unitSize};`, 1);

    // Total side length of a HTML tag, including margin, border, padding, and content
    const templateWord = $('<div class="word"></div>').toggleClass('word-size');

    const display = $('#memory-display');
    for (let i = 0; i < this.heap.size; ++i) {
      display.append(templateWord);
    }
  }
}

export { MemoryDisplay };