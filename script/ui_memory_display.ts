import { MarkSweep } from "./gc";
import { Heap } from "./heap";
import 'jquery';

const BASE_UNIT_SIZE = 64;
const SIZE_SHRINK_PERIOD = 128;

export class MemoryDisplay {
  public heap: Heap;
  public unitSize: number;

  /**
   * @param {number} size 
   */
  constructor(size: number) {
    // "Declaring" properties
    this.heap = null;
    this.unitSize = 0;
    
    this.init(size);
  }

  public init(size: number): void {
    this.heap = new Heap(size);
    this.heap.gc = new MarkSweep(this.heap);
    this.populateWordElements();
  }

  public populateWordElements(): void {
    // Limit the number used for unitSize calculation so that it doesn't go crazyly tiny when heap size is larger
    const shrinkFactor = SIZE_SHRINK_PERIOD / Math.min(this.size, 1024);
    const unitSize = BASE_UNIT_SIZE * shrinkFactor;
    this.unitSize = unitSize;

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

    $('.word').addClass('free');
  }

  get size() {
    return this.heap.size;
  }

  set size(size) {
    this.heap.size = size;
  }
}
