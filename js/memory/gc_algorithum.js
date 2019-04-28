import { VirtualObject } from './objects.js';
import { Heap, MarkingFragments, UNKNOWN, OCCUPIED, OCCUPIED_SAFE, OCCUPIED_DEAD } from './heap.js';
import { Iteration } from '../iteration.js';


class MarkSweep {
  /**
   * @param {Heap} heap 
   */
  constructor(heap) {
    this.heap = heap;
    this.marked = false;
  }

  mark() {
    if (this.marked) {
      throw `The heap ${this.heap} is already marked`;
    }

    this.heap.fragmentsFree.clear();
    this.heap.fragmentsOccupied.clear();

    // Extra Idoit-Proof checks, should never happen
    if (this.heap.stateMap.includes(UNKNOWN)) {
      throw "Existing unknown states in the state map";
    }
    // Let 'fragmentsOccupied' mark added fragments their state safe, as they are reachable
    this.heap.fragmentsOccupied.stateOnAdd = OCCUPIED_SAFE;
    // Reachability test to all objects
    new ObjectGraphIterator(this.heap.fragmentsOccupied).iterateObjectGraph(this.heap.references);
    // Since all occupied states become UNKNOWN on 'clear', and reachable ones will be marked as OCCUPIED_SAFE, the rest will be OCCUPIED_DEAD
    this.heap.stateMap.map(state => state === UNKNOWN ? OCCUPIED_DEAD : state);
    // Let 'fragmentsOccupied' mark added fragments their state regular occupied as before
    this.heap.fragmentsOccupied.stateOnAdd = OCCUPIED;

    this.marked = true;
  }

  sweep() {
    if (!this.marked) {
      throw `The heap ${this.heap} is not marked yet`;
    }

    // Head of the a potential free fragment, always moved to 'end + 1' of a occupied fragment
    // "potential" because there might be multiple consecitive occupied fragments
    let head = 0;
    this.heap.fragmentsOccupied.forEach(fragment => {
      if (head < fragment.begin) {
        this.heap.fragmentsFree.addRange(head, fragment.begin - 1);
      }
      head = fragment.end + 1;
      return Iteration.CONTINUE;
    });

    // Do this one more time for the last fragment, as there might be a fragment after all other occupied ones
    if (head < this.heap.fragmentsOccupied.lastFragment.begin) {
      this.heap.fragmentsFree.addRange(head, fragment.begin - 1);
    }

    // Remove all marks
    this.heap.stateMap.map(state => state === OCCUPIED_DEAD || state === OCCUPIED_SAFE ? OCCUPIED : state);
    this.marked = false;
  }

  updateObjectContainer() {
    for (let i = 0; i < this.heap.objects.length; ++i) {
      const object = this.heap.objects[i];

      let matched = false;
      this.heap.fragmentsOccupied.forEach(fragment => {
        if (object.begin === fragment.begin && object.size === fragment.size) {
          matched = true;
          return Iteration.TERMINATE;
        }
        return Iteration.CONTINUE;
      });

      if (!matched) {
        this.heap.objects[i] = undefined;
      }
    }

    this.heap.objects.filter(e => e !== undefined);
  }

  collect() {
    this.mark();
    this.sweep();
    this.updateObjectContainer();
  }
}

/**
 * Internal iterating utility object.
 * @private
 */
class ObjectGraphIterator {
  /**
   * @param {MarkingFragments} fragmentsOccupied 
   */
  constructor(fragmentsOccupied) {
    this.fragmentsOccupied = fragmentsOccupied;
    this.visited = new Set();
  }

  /**
   * @param {VirtualObject[]} references 
   */
  iterateObjectGraph(references) {
    for (const object of references) {
      if (!this.visited.has(object)) {
        this.visited.add(object);
        this.fragmentsOccupied.addAt(object.begin, object.size);
        this.iterateObjectGraph(object.ref);
      }
    }
  }
}

export { MarkSweep };
