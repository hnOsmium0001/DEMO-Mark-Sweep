import { FREE, Heap, MarkingFragments, OCCUPIED, OCCUPIED_ALIVE, OCCUPIED_DEAD, UNKNOWN } from "../memory/heap.js";
import { regenerateObjects } from '../memory/objects.js';
import { MemoryDisplay } from "./memory_display.js";
import { findFragmentCovers, findObjectCovers } from "../utils.js";
import { ObservableArray } from "../array.js";

function highlightFragment(bindings, element) {
  element.toggleClass('word-selected');

  const wordIndex = element.data('index');
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
}

/**
   * @param {Bindings} bindings 
   */
function bindUnitHighlighting(bindings) {
  const toggleClass = function() {
    highlightFragment(bindings, $(this));
  };
  $('.word').hover(/* Hover */ toggleClass, /* Unhover */ toggleClass);
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

function getOverlayContext() {
  // First get the actual DOM element, and then use the HTML way to get ctx
  return $('#memory-overlay')[0].getContext('2d');
}

// Length of head, pixels
const HEAD_LENGTH = 10;

function drawArrow(fromX, fromY, toX, toY) {
  const ctx = getOverlayContext();
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.lineTo(toX - HEAD_LENGTH * Math.cos(angle - Math.PI / 6), toY - HEAD_LENGTH * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - HEAD_LENGTH * Math.cos(angle + Math.PI / 6), toY - HEAD_LENGTH * Math.sin(angle + Math.PI / 6));
  ctx.lineWidth = 2;
  ctx.stroke();
}

function middleOf(bindings, position) {
  const halfUnitSize = bindings.memoryDisplay.unitSize / 2;
  return {
    x: position.left + halfUnitSize,
    y: position.top + halfUnitSize
  };
}

/**
 * @param {Bindings} bindings 
 */
function bindUnitLinking(bindings) {
  const ctx = getOverlayContext();
  $('.word').hover(function () {
    const currentObject = findObjectCovers(bindings.objects, $(this).data('index'));
    if (currentObject === null) {
      return;
    }

    const { x, y } = middleOf(bindings, $(`#word-${currentObject.begin}`).position());
    for (const object of currentObject.ref) {
      const element = $(`#word-${object.begin}`);
      const { x: targetX, y: targetY } = middleOf(bindings, element.position());
      highlightFragment(bindings, element);
      drawArrow(x, y, targetX, targetY);
    }
  }, function () {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const currentObject = findObjectCovers(bindings.objects, $(this).data('index'));
    if (currentObject === null) {
      return
    }
    for (const object of currentObject.ref) {
      highlightFragment(bindings, $(`#word-${object.begin}`));
    }
  });
}

// ---------------------------------------------------------------- //

function resetCanvasSize() {
  // Set the size of overlay canvas based on the size of dispaly element
  const display = $('#memory-display');
  const ctx = getOverlayContext();
  // Use .outerWidth() to include the padding
  ctx.canvas.width = display.outerWidth();
  ctx.canvas.height = display.outerHeight();
}

// ---------------------------------------------------------------- //

/**
 * @param {Bindings} bindings 
 */
function bindButtonClicks(bindings) {
  $('#reset').click(function () {
    bindings.memoryDisplay.init(parseInt($('#heap-size').val()));
    bindUnitHighlighting(bindings);
    bindUnitColoring(bindings);
    bindUnitLinking(bindings);
    resetCanvasSize(bindings);
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
  bindUnitLinking,
  resetCanvasSize,
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

  /**
   * @returns {ObservableArray}
   */
  get objects() {
    return this.heap.objects;
  }
}

export { Bindings };

