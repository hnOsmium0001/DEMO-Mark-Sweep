import { FREE, Heap, MarkingFragments, OCCUPIED, OCCUPIED_ALIVE, OCCUPIED_DEAD, UNKNOWN } from "./heap";
import { Fragment } from './fragment';
import { regenerateObjects } from './objects';
import { MemoryDisplay } from "./ui_memory_display";
import { findFragmentCovers, findObjectCovers } from "./utils";
import { ObservableArray } from "./array";
import $ from 'jquery';

interface Point {
  x: number;
  y: number;
}

function highlightFragment(fragment: Fragment, element: JQuery<any>, className: string): void {
  element.toggleClass(className);

  const wordIndex = element.data('index');

  // If we can't find such fragment in either storage, we skip this process
  if (fragment == null) {
    return;
  }
  for (let i = wordIndex; i >= fragment.begin; --i) {
    $(`#word-${i}`).toggleClass(className);
  }
  for (let i = wordIndex; i <= fragment.end; ++i) {
    $(`#word-${i}`).toggleClass(className);
  }
}

function bindUnitHighlighting(bindings: Bindings): void {
  const toggleClass = function () {
    const wordIndex = $(this).data('index');
    const fragment = findFragmentCovers(bindings.fragmentsOccupied, wordIndex) || findFragmentCovers(bindings.fragmentsFree, wordIndex);
    highlightFragment(fragment, $(this), 'word-selected');
  };
  $('.word').hover(/* Hover */ toggleClass, /* Unhover */ toggleClass);
}

const state2Class: {
  [key: number]: string
} = {};
state2Class[UNKNOWN] = 'unknown';
state2Class[FREE] = 'free';
state2Class[OCCUPIED] = 'occupied-unmarked';
state2Class[OCCUPIED_ALIVE] = 'occupied-marked-alive';
state2Class[OCCUPIED_DEAD] = 'occupied-marked-dead';

function bindUnitColoring(bindings: Bindings): void {
  bindings.stateMap.subscribe(updatedIndices => {
    for (const i of updatedIndices) {
      // Override the class attribute to the original state, and then add the color class
      $(`#word-${i}`)
        .prop('class', 'word word-sizing')
        .addClass(state2Class[bindings.stateMap.at(i)]);
    }
  });
}

function getOverlayContext(): CanvasRenderingContext2D {
  // First get the actual DOM element, and then use the HTML way to get ctx
  return ($('#memory-overlay')[0] as HTMLCanvasElement)
    .getContext('2d');
}

// Length of head, pixels
const HEAD_LENGTH = 10;

function drawArrow(fromX: number, fromY: number, toX: number, toY: number): void {
  const ctx = getOverlayContext();
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  // Arrow body
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  // Arrow head
  ctx.lineTo(toX - HEAD_LENGTH * Math.cos(angle - Math.PI / 6), toY - HEAD_LENGTH * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - HEAD_LENGTH * Math.cos(angle + Math.PI / 6), toY - HEAD_LENGTH * Math.sin(angle + Math.PI / 6));
  ctx.lineWidth = 2;
  ctx.stroke();
}

const RADIUS = 16;

function loopArrow(x: number, y: number): void {
  const ctx = getOverlayContext();
  // Arrow always face down (0, 0) -> (0.3, 1) : atan2(1 - 0, 0.3 - 0)
  // Magic number just made it look nice
  const angle = Math.atan2(1, 0.3);
  ctx.beginPath();
  // Set the arrow body left the the center
  // Arrow body
  ctx.arc(x - RADIUS, y, RADIUS, 0, 2 * Math.PI);
  // Arrow head
  ctx.moveTo(x, y);
  ctx.lineTo(x - HEAD_LENGTH * Math.cos(angle - Math.PI / 6), y - HEAD_LENGTH * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(x, y);
  ctx.lineTo(x - HEAD_LENGTH * Math.cos(angle + Math.PI / 6), y - HEAD_LENGTH * Math.sin(angle + Math.PI / 6));
  ctx.lineWidth = 2;
  ctx.stroke();
}

function middleOf(bindings: Bindings, position: JQuery.Coordinates): Point {
  const halfUnitSize = bindings.memoryDisplay.unitSize / 2;
  return {
    x: position.left + halfUnitSize,
    y: position.top + halfUnitSize
  };
}

function bindUnitLinking(bindings: Bindings): void {
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

      // Reference to the object itself
      if (object === currentObject) {
        loopArrow(x, y);
      } else {
        // Don't highlight the object iself again
        highlightFragment(bindings.fragmentsOccupied.getBeginsAt(object.begin), element, 'word-referenced');
        drawArrow(x, y, targetX, targetY);
      }
    }
  }, function () {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const currentObject = findObjectCovers(bindings.objects, $(this).data('index'));
    if (currentObject === null) {
      return;
    }
    for (const object of currentObject.ref) {
      // Don't highlight the object iself again
      if (object === currentObject) {
        continue;
      }
      highlightFragment(bindings.fragmentsOccupied.getBeginsAt(object.begin), $(`#word-${object.begin}`), 'word-referenced');
    }
  });
}

function resizeOverlay(canvas: HTMLCanvasElement): void {
  // Set the size of overlay canvas based on the size of dispaly element
  const display = $('#memory-display');
  // Use .outerWidth() to include the padding
  canvas.width = display.outerWidth();
  canvas.height = display.outerHeight();
}

function resetOverlayProperties(): void {
  const ctx = getOverlayContext();
  const canvas = ctx.canvas;

  resizeOverlay(canvas);
}

function bindButtonClicks(bindings: Bindings): void {
  $('#reset').click(() => {
    bindings.memoryDisplay.init(parseInt($('#heap-size').val() as string));
    bindUnitHighlighting(bindings);
    bindUnitColoring(bindings);
    bindUnitLinking(bindings);
    resetOverlayProperties();
  });

  $('#regenerate-objects').click(() => {
    regenerateObjects(bindings.heap);
  });

  $('#mark').click(() => {
    bindings.heap.gc.mark();
  });
  $('#sweep').click(() => {
    bindings.heap.gc.sweep();
    bindings.heap.gc.updateObjectContainer();
  });
}

function bindOtherEvents(bindings: Bindings): void {
  $(window).resize(() => {
    resizeOverlay($('#memory-overlay')[0] as HTMLCanvasElement);
  })
}

//////////////////////////////////////////////////////////////////////
// ---------------------------------------------------------------- //
//////////////////////////////////////////////////////////////////////

const bindingFunctions: {(bindings: Bindings): void}[] = [
  bindUnitHighlighting,
  bindUnitColoring,
  bindUnitLinking,
  resetOverlayProperties,
  bindButtonClicks,
  bindOtherEvents
];

export class Bindings {
  public memoryDisplay: MemoryDisplay;

  public constructor(memoryDisplay: MemoryDisplay) {
    this.memoryDisplay = memoryDisplay;
  }

  public bindAll(): void {
    bindingFunctions.forEach(func => func(this));
  }

  get heap() {
    return this.memoryDisplay.heap;
  }

  get fragmentsOccupied() {
    return this.heap.fragmentsOccupied;
  }

  get fragmentsFree() {
    return this.heap.fragmentsFree;
  }

  get stateMap() {
    return this.heap.stateMap;
  }

  get objects() {
    return this.heap.objects;
  }
}
