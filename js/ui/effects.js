import { MemoryDisplay } from "./memory_display.js";
import { Heap } from "../memory/heap.js";

const BINDING_FUNCTIONS = [
  /**
   * @param {Bindings} bindings 
   */
  function bindUnitHighlighting(bindings) {
    const stateMap = bindings.stateMap;
    const toggleClasses = () => {
      $(this).toggleClass('word-selected');
      const wordIndex = $(this).prop('data-word-index');
      const currentState = stateMap[wordIndex];

      let previous = wordIndex - 1;
      while (stateMap[previous] === currentState) {
        $(`word-${previous}`).toggleClass('word-selected');
        --previous;
      }

      let following = wordIndex + 1;
      while (stateMap[following] === currentState) {
        $(`word-${following}`).toggleClass('word-selected');
        ++following;
      }

    };
    $('word').hover(/* Hover */ toggleClasses, /* Unhover */ toggleClasses);
  }
];

class Bindings {
  /**
   * @param {MemoryDisplay} memoryDisplay 
   */
  constructor(memoryDisplay) {
    this.memoryDisplay = memoryDisplay;
  }

  bindAll() {
    BINDING_FUNCTIONS.forEach(func => func(this));
  }

  /**
   * @returns {Heap}
   */
  get heap() {
    return this.memoryDisplay.heap;
  }

  /**
   * @returns {number[]}
   */
  get stateMap() {
    return this.heap.stateMap;
  }
}

export { Bindings, BINDING_FUNCTIONS };