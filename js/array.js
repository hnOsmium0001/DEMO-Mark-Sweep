/**
 * Create an arithmethic sequence where the first element is 'start', the last element is 'end - 1'.
 * 
 * @param {number} [start = 0] Inclusive, start of the sequence.
 * @param {number} end Exclusive,  it -1 is end of the sequence.
 * @returns {number[]} An arithmetic sequence.
 */
function range(start = 0, end) {
  return Array.from(Array(end - start), (v, i) => i + start);
}

class ObservableArray {
  /**
   * @param {number} [size = 0] 
   * @param {any} [value = undefined]
   */
  constructor(size = 0, value = undefined) {
    this.handle = new Array(size).fill(value);
    this.subscribers = [];
  }

  /**
   * Subscribe to write events.
   * 
   * @param {(updatedIndices: number[]) => void} subscriber 
   */
  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  /**
   * @param {number[]} updatedIndices 
   * @private
   */
  fire(updatedIndices) {
    for (const subscriber of this.subscribers) {
      subscriber(updatedIndices);
    }
  }

  /**
   * Fires event.
   *  
   * @param {any} value 
   * @param {number} [start = 0] 
   * @param {number} [end = this.handle.length]
   */
  fill(value, start = 0, end = this.handle.length) {
    this.handle.fill(value, start, end);
    this.fire(range(start, end));
    return this;
  }

  includes(value) {
    return this.handle.includes(value);
  }

  map(callback) {
    return this.handle.map(callback);
  }

  /**
   * Fires event.
   */
  mapInplace(callback) {
    for (let i = 0; i < this.handle.length; ++i) {
      this.handle[i] = callback(this.handle[i], i);
    }
    this.fire(range(0, this.handle.length));
    return this;
  }

  clear() {
    this.handle.length = 0;
  }

  at(i) {
    return this.handle[i];
  }

  /**
   * Fires event.
   */
  put(i, value) {
    this.handle[i] = value;
    this.fire([i]);
  }
}

export { range, ObservableArray };
