/**
 * Create an arithmethic sequence where the first element is 'start', the last element is 'end - 1'.
 * 
 * @param {number} [start = 0] Inclusive, start of the sequence.
 * @param {number} end Exclusive,  it -1 is end of the sequence.
 * @returns {number[]} An arithmetic sequence.
 */
export function range(start: number = 0, end: number): number[] {
  return Array.from(new Array(end - start), (v, i) => i + start);
}

export class ObservableArray<T> implements Iterable<T> {
  public handle: Array<T>;
  public subscribers: { (updatedIndices: number[]): void }[];

  constructor(size = 0, value: T = undefined) {
    this.handle = new Array(size).fill(value);
    this.subscribers = [];
  }

  /**
   * Subscribe to write events.
   * 
   * @param {(updatedIndices: number[]) => void} subscriber 
   */
  public subscribe(subscriber: (updatedIndices: number[]) => void): void {
    this.subscribers.push(subscriber);
  }

  private fire(updatedIndices: number[]): void {
    for (const subscriber of this.subscribers) {
      subscriber(updatedIndices);
    }
  }

  /**
   * Fires event.
   *  
   * @param {T} value 
   * @param {number} [start = 0] 
   * @param {number} [end = this.length]
   */
  public fill(value: T, start: number = 0, end: number = this.length): ObservableArray<T> {
    this.handle.fill(value, start, end);
    this.fire(range(start, end));
    return this;
  }

  public includes(value: T) {
    return this.handle.includes(value);
  }

  public map(callback: (value: T, index: number, array: T[]) => T): ObservableArray<T> {
    const observableArray = new ObservableArray<T>(this.length);
    observableArray.handle = this.handle.map(callback)
    return observableArray;
  }

  /**
   * Fires event.
   */
  public mapInplace(callback: (arg0: T, arg1: number) => T): ObservableArray<T> {
    for (let i = 0; i < this.length; ++i) {
      this.handle[i] = callback(this.handle[i], i);
    }
    this.fire(range(0, this.length));
    return this;
  }

  public clear(): void {
    this.length = 0;
  }

  public at(i: number): T {
    return this.handle[i];
  }

  /**
   * Fires event.
   */
  public put(i: number, value: T): void {
    this.handle[i] = value;
    this.fire([i]);
  }

  get length() {
    return this.handle.length;
  }

  set length(length) {
    this.handle.length = length;
  }

  public [Symbol.iterator](): Iterator<T, any, undefined> {
    return this.handle[Symbol.iterator]();
  }
}
