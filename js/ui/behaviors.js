import { Iteration } from "../iteration.js";
import { FREE, Heap, MarkingFragments, OCCUPIED, OCCUPIED_ALIVE, OCCUPIED_DEAD, UNKNOWN } from "../memory/heap.js";
import { VirtualObject } from '../memory/objects.js';
import { MemoryDisplay } from "./memory_display.js";

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
  return result
}

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
}

// ---------------------------------------------------------------- //

const state2Class = {};
state2Class[UNKNOWN] = 'unknown';
state2Class[FREE] = 'free';
state2Class[OCCUPIED] = 'occupied-unmarked';
state2Class[OCCUPIED_ALIVE] = 'occupied-marked-alive';
state2Class[OCCUPIED_DEAD] = 'occupied-marked-dead';

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
}

// ---------------------------------------------------------------- //

// TODO truly random
function regenerateObjects(heap) {
  const obj_o1_1 = VirtualObject.create(2, [], heap); // 0
  const obj_o1 = VirtualObject.create(3, [obj_o1_1], heap); // 1

  const obj_o2_1 = VirtualObject.create(2, [], heap); // 2
  const obj_o2_2 = VirtualObject.create(2, [], heap); // 3
  obj_o1_1.ref.push(obj_o2_2);
  const obj_o2 = VirtualObject.create(6, [obj_o2_1, obj_o2_2], heap); // 4

  const obj_o3 = VirtualObject.create(1, [], heap); // 5

  const wildObj = VirtualObject.create(1, [], heap) // 6

  const obj = VirtualObject.create(2, [obj_o1, obj_o2, obj_o3], heap); // 7
  const obj2 = VirtualObject.create(4, [obj_o1, obj], heap); // 8
  obj_o3.ref.push(obj);
  obj_o3.ref.push(obj2);

  heap.addReference(obj);
  heap.addReference(obj2);

  // Loop referencing
  const randomObj1 = VirtualObject.create(2, [], heap); // 9
  const randomObj2 = VirtualObject.create(8, [randomObj1, obj_o1, obj], heap) // 10
  randomObj1.ref.push(randomObj2);
}

/**
 * @param {Bindings} bindings 
 */
function bindButtonClicks(bindings) {
  $('#reset').click(function () {
    bindings.memoryDisplay.init(parseInt($('#heap-size').val()));
    bindUnitHighlighting(bindings);
    bindUnitColoring(bindings);
  });

  $('#regenerate-objects').click(function () {
    regenerateObjects(bindings.heap);
  });

  $('#mark').click(function () {
    bindings.heap.gc.mark();
  });
  $('#sweep').click(function () {
    bindings.heap.gc.sweep();
    bindings.heap.gc.updateObjectContainer();
  });
}

//////////////////////////////////////////////////////////////////////
// ---------------------------------------------------------------- //
//////////////////////////////////////////////////////////////////////

/**
 * @type {((bindings: Bindings) => void)[]}
 */
const BINDING_FUNCTIONS = [
  bindUnitHighlighting,
  bindUnitColoring,
  bindButtonClicks
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

export { Bindings };

