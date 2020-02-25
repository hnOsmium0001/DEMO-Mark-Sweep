import { Iteration } from './utils';
import { Heap, MarkingFragments, OCCUPIED, OCCUPIED_ALIVE, OCCUPIED_DEAD } from './heap';
import { VirtualObject } from './objects';

export class MarkSweep {
  public heap: Heap;
  public marked: boolean;

  constructor(heap: Heap) {
    this.heap = heap;
    this.marked = false;
  }

  public mark(): void {
    if (this.marked) {
      throw `The heap ${this.heap} is already marked`;
    }

    // Clear fragment storage but don't wipe out the stateMap
    // Keep the stateMap, and after marking the live objects, all the OCCUPIED left are OCCUPIED_DEAD
    this.heap.fragmentsFree.clear(false);
    this.heap.fragmentsOccupied.clear(false);

    // Let 'fragmentsOccupied' mark added fragments their state safe, as they are reachable
    this.heap.fragmentsOccupied.stateOnAdd = OCCUPIED_ALIVE;
    // Reachability test to all objects
    new ObjectGraphIterator(this.heap.fragmentsOccupied).iterateObjectGraph(this.heap.root);
    // Since all occupied states are untouched during marking, and the reachable ones are marked as OCCUPIED_LIVE, they are deade (unreachable)
    this.heap.stateMap.mapInplace((state: number) => state === OCCUPIED ? OCCUPIED_DEAD : state);
    // Let 'fragmentsOccupied' mark added fragments their state regular occupied as before
    this.heap.fragmentsOccupied.stateOnAdd = OCCUPIED;

    this.marked = true;
  }

  public sweep(): void {
    if (!this.marked) {
      throw `The heap ${this.heap} is not marked yet`;
    }

    // Head of the a potential free fragment, always moved to 'end + 1' of a occupied fragment
    // "potential" because there might be multiple consecitive occupied fragments
    let head = 0;
    this.heap.fragmentsOccupied.forEach((fragment: { begin: number; end: number; }) => {
      if (head < fragment.begin) {
        this.heap.fragmentsFree.addRange(head, fragment.begin - 1);
      }
      head = fragment.end + 1;
      return Iteration.CONTINUE;
    });

    // Do this one more time for the last fragment, as there might be a fragment after all other occupied ones
    if (head < this.heap.fragmentsOccupied.fragmentAfterEnd.begin) {
      this.heap.fragmentsFree.addRange(head, this.heap.stateMap.length - 1);
    }

    // Remove all marks
    this.heap.stateMap.mapInplace((state: number) => state === OCCUPIED_ALIVE || state === OCCUPIED_DEAD ? OCCUPIED : state);
    this.marked = false;
  }

  public updateObjectContainer(): void {
    for (let i = 0; i < this.heap.objects.length; ++i) {
      const object = this.heap.objects[i];

      let matched = false;
      this.heap.fragmentsOccupied.forEach((fragment: { begin: any; size: any; }) => {
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

    this.heap.objects = this.heap.objects.filter((e: any) => e !== undefined);
  }

  public collect(): void {
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
  public fragmentsOccupied: MarkingFragments;
  public visited: Set<VirtualObject>;

  constructor(fragmentsOccupied: MarkingFragments) {
    this.fragmentsOccupied = fragmentsOccupied;
    this.visited = new Set();
  }

  public iterateObjectGraph(references: VirtualObject[]): void {
    for (const object of references) {
      if (!this.visited.has(object)) {
        this.visited.add(object);
        this.fragmentsOccupied.addAt(object.begin, object.size);
        this.iterateObjectGraph(object.ref);
      }
    }
  }
}
