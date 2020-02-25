import { ObservableArray } from './array';
import { Iteration } from './utils';
import { Fragment, Fragments } from './fragment';
import { MarkSweep } from './gc';
import { VirtualObject } from './objects';

/** Unit in unknown state, created when the unit is being removed. */
export const UNKNOWN = 0;
/** Free unit */
export const FREE = 1;
/** Occupied, unmarked unit. */
export const OCCUPIED = 2;
/** Occupied, marked unit and is safe from sweep. */
export const OCCUPIED_ALIVE = 3;
/** Occupied, marked unit but need to be sweeped. */
export const OCCUPIED_DEAD = 4;

export class MarkingFragments extends Fragments {
  public heap: Heap;
  public stateOnAdd: number;

  constructor(heap: Heap, stateOnAdd: number) {
    super(heap.size);
    this.heap = heap;
    this.stateOnAdd = stateOnAdd;
  }

  public remove(fragment: Fragment): boolean {
    this.heap.stateMap.fill(UNKNOWN, fragment.begin, fragment.end + 1);
    return super.remove(fragment);
  }

  public insertFragmentAt(fragment: Fragment, i: number): boolean {
    this.heap.stateMap.fill(this.stateOnAdd, fragment.begin, fragment.end + 1);
    return super.insertFragmentAt(fragment, i);
  }

  public clear(wipeStateMap: boolean = true): void {
    if (wipeStateMap) {
      this.heap.stateMap.mapInplace((state: number) => state === this.stateOnAdd ? UNKNOWN : state);
    }
    super.clear();
  }
}

export class Heap {
  public size: number;
  public fragmentsFree: MarkingFragments;
  public fragmentsOccupied: MarkingFragments;
  public stateMap: ObservableArray<number>;
  private _gc: MarkSweep;
  public objects: VirtualObject[];
  public root: VirtualObject[];

  constructor(size: number) {
    this.size = size;
    this.fragmentsFree = new MarkingFragments(this, FREE);
    this.fragmentsOccupied = new MarkingFragments(this, OCCUPIED);
    // Use 'new' since it is this best way to create an array with certain length here
    this.stateMap = new ObservableArray(size, UNKNOWN);
    this._gc = null;
    this.objects = [];
    // References to objects in 'this.objects'
    this.root = [];

    this.fragmentsFree.addRange(0, this.endIndex);
  }
  
  public addReference(ptr: VirtualObject): void {
    if (!this.root.includes(ptr)) {
      this.root.push(ptr);
    }
  }

  public clearReferences(): void {
    this.root = [];
  }

  /**
   * Finds a free fragment that fits an object with the given size, cut out extras if necessary, and mark the rest occupied.
   *
   * @param {number} size 
   * @returns {number} Start of a fragment that fits an object that is given size. If allocation failed, it will return {@constant -1}.
   */
  public allocatePure(size: number): number {
    let result = -1;

    this.fragmentsFree.forEach(fragment => {
      if (fragment.size >= size) {
        const unused = fragment.size - size;
        this.fragmentsFree.remove(fragment);
        this.fragmentsOccupied.addAt(fragment.begin, size);
        this.fragmentsFree.addAt(fragment.begin + size, unused);

        result = fragment.begin;
        return Iteration.TERMINATE;
      }
      return Iteration.CONTINUE;
    });

    return result;
  }

  /**
   * Finds a free fragment that fits an object with the given size, cut out extras if necessary, and mark the rest occupied.
   * If it was unable to find such fragment, it will try to rearrange all the occupied fragments so that they're all in a big chunk.
   * 
   * @param {number} size 
   * @returns {number} Start of a fragment that fits an object that is given size. If allocation failed, it will return {@constant -1}.
   * @see #allocatePure(number)
   * @see #sortFragments()
   */
  public allocate(size: any): number {
    const result = this.allocatePure(size);
    if (result === -1) {
      this.sortFragments();
      return this.allocatePure(size);
    }
    return result;
  }

  /**
   * @param {number} ptr Start of a fragment, in {@code this.fragmentsFree}.
   */
  public free(ptr: number): void {
    const fragment = this.fragmentsOccupied.getBeginsAt(ptr);
    this.fragmentsOccupied.remove(fragment);
    this.fragmentsFree.add(fragment);
  }

  public sortFragments(): void {
    this.fragmentsFree.clear();

    let movingTarget = 0;
    this.fragmentsOccupied.forEach(fragment => {
      if (fragment.begin != movingTarget) {
        fragment.begin = movingTarget;
      }
      movingTarget = fragment.end + 1;
      return Iteration.CONTINUE;
    });

    this.fragmentsFree.addAt(movingTarget, this.endIndex - movingTarget + 1);
  }

  get endIndex(): number {
    return this.size - 1;
  }

  get gc(): MarkSweep {
    return this._gc;
  }

  set gc(gc: MarkSweep) {
    if (typeof gc.collect === 'function') {
      this._gc = gc;
    } else {
      throw 'Cannot register a GC algorithum that is disfunctional (missing method "collect()")';
    }
  }
}
