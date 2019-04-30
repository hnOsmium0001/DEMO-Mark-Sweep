import { Iteration } from "../utils.js";
import { FREE, Heap, MarkingFragments, OCCUPIED, OCCUPIED_ALIVE, OCCUPIED_DEAD, UNKNOWN } from "../memory/heap.js";
import { VirtualObject } from '../memory/objects.js';
import { MemoryDisplay } from "./memory_display.js";
import { random, randomBoolean } from "../utils.js";

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

const MIN_OBJECT_SIZE = 2;
const MAX_OBJECT_SIZE = 10;

function generateObjects(heap, objects) {
  // Between 1/2 and 2/3 of the heap
  let amountToFill = random(heap.size * (1 / 2), heap.size * (2 / 3));
  while (amountToFill > 0) {
    const objectSize = Math.min(random(MIN_OBJECT_SIZE, MAX_OBJECT_SIZE), amountToFill);
    // We will add references later
    const object = VirtualObject.create(objectSize, [], heap, false);
    // Unable to allocate enough space for the object, which means the heap is almost full
    // because our limit is far off the filling it to full.
    if (!object) {
      console.log('Unable to allocare enough space for the object, stopped object generation algorithum')
      break;
    }

    objects.push(object);
    amountToFill -= objectSize;
  }
}

const MAX_AMOUNT_OBJECT_REFERENCES = 6;
const DEAD_OBJECTS_WEIGHT = 3;
const ALIVE_OBJECTS_WEIGHT = 5;

function generateReferences(objects) {
  // Make some objects dead (unreachable)
  const deadObjects = objects.filter(object => randomBoolean(DEAD_OBJECTS_WEIGHT, ALIVE_OBJECTS_WEIGHT));
  // Choose all objects that are not dead
  const referableObjects = objects.filter(object => !deadObjects.includes(object));

  // Generate references for all objects, even those who are determined as dead
  // The dead ones will refer to other objects, however no body will refer to them
  for (const object of objects) {
    const amountToGenerate = Math.min(random(0, MAX_AMOUNT_OBJECT_REFERENCES), referableObjects.length);
    const selected = new Set();

    for (let i = 0; i < amountToGenerate; ++i) {
      const referenceIndex = random(0, referableObjects.length - 1);
      if (selected.has(referenceIndex)) {
        // Redo loop
        --i;
        continue;
      }
      selected.add(referableObjects[referenceIndex]);
    }

    object.ref = [...selected];
  }
}

const MAX_AMOUNT_ROOTS = 3;

function generateRoots(heap, objects) {
  // In case of this algorithum being executed when heap isn't empty, is allows adding root reference work correctly
  const initialAmountRoots = heap.root.length;
  const amountRoots = Math.min(random(1, MAX_AMOUNT_ROOTS), objects.length);
  while (heap.root.length - initialAmountRoots < amountRoots) {
    heap.addReference(objects[random(0, objects.length - 1)]);
  }
}

function regenerateObjects(heap) {
  const objects = [];
  generateObjects(heap, objects);
  generateReferences(objects);
  generateRoots(heap, objects);
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

