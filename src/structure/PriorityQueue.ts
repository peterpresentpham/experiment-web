type TComparator<T> = (a: T, b: T) => number;

export class PriorityQueue<T> {
  private heap: T[] = [];
  private compare: TComparator<T>;

  constructor(compare: TComparator<T>) {
    this.compare = compare;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  push(value: T) {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const top = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return top;
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parent]) >= 0) break;
      this.swap(index, parent);
      index = parent;
    }
  }

  private bubbleDown(index: number) {
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }

      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
