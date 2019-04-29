import { Iteration } from "../iteration.js";
import { FREE, Heap, MarkingFragments, OCCUPIED, OCCUPIED_ALIVE, OCCUPIED_DEAD, UNKNOWN } from "../memory/heap.js";
import { MemoryDisplay } from "./memory_display.js";

const state2Class = {};
state2Class[UNKNOWN] = 'unknown';
state2Class[FREE] = 'free';
state2Class[OCCUPIED] = 'occupied-unmarked';
state2Class[OCCUPIED_ALIVE] = 'occupied-marked-alive';
state2Class[OCCUPIED_DEAD] = 'occupied-marked-dead';

/**
 * @param {Fragments} fragments 
 * @param {number} ptr 
 */
function findFragmentCovers(fragments, ptr) {
  let result = null;
  fragments.forEach(fragment => {
    if (fragment.begin <= ptr && fragment.end >= ptr) {
      result = fragment;
      return Iteration.TERMINATE;
    }
    return Iteration.CONTINUE;
  });
  return result;
}

/**
 * @type {((bindings: Bindings) => void)[]}
 */
const BINDING_FUNCTIONS = [
  /**
   * @param {Bindings} bindings 
   */
  function bindUnitHighlighting(bindings) {
    const stateMap = bindings.stateMap;
    // Use the keyword function to define it so that 'this' can be bond dynamically by jQuery
    const toggleClasses = function () {
      // This is unnecessary since it is already achieved by using word:hover in CSS
      // $(this).toggleClass('word-selected');
      
      const wordIndex = $(this).data('index');
      const fragment = findFragmentCovers(bindings.fragmentsOccupied, wordIndex) || findFragmentCovers(bindings.fragmentsFree, wordIndex);

      // If we can't find such fragment in either storage, we skip this process
      if (fragment == null) {
        return;
      }
      for (let i = wordIndex; i >= fragment.begin; --i) {
        $(`#word-${i}`).toggleClass('word-selected');
      }
      for (let i = wordIndex; i <= fragment.end; ++i) {
        $(`#word-${i}`).toggleClass('word-selected');
      }
    };
    $('.word').hover(/* Hover */ toggleClasses, /* Unhover */ toggleClasses);
  },

  /**
   * @param {Bindings} bindings 
   */
  function bindUnitColoring(bindings) {
    bindings.stateMap.subscribe(updatedIndices => {
      for (const i of updatedIndices) {
        // Override the class attribute to the original state, and then add the color class
        $(`#word-${i}`).prop('class', 'word word-sizing').addClass(state2Class[bindings.stateMap.at(i)]);
      }
    });
  },

  /**
   * @param {Bindings} bindings 
   */
  function bindButtonClicks(bindings) {
    $('#mark').click(function() {
      bindings.heap.gc.mark();
    });
    $('#sweep').click(function() {
      bindings.heap.gc.sweep();
      bindings.heap.gc.updateObjectContainer();
    });
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
   * @returns {MarkingFragments}
   */
  get fragmentsOccupied() {
    return this.heap.fragmentsOccupied;
  }

  /**
   * @returns {MarkingFragments}
   */
  get fragmentsFree() {
    return this.heap.fragmentsFree;
  }

  /**
   * @returns {number[]}
   */
  get stateMap() {
    return this.heap.stateMap;
  }
}

export { Bindings, BINDING_FUNCTIONS };

