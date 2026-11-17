export default class Queue<T> {
  private items: T[] = [];
  private head = 0;
  private tail = 0;

  enqueue(item: T): number {
    this.items[this.tail++] = item;
    return this.tail - this.head;
  }

  dequeue(): T {
    const item = this.items[this.head];
    delete this.items[this.head++];

    // memory cleanup
    if (this.head > 1000 && this.head * 2 > this.tail) {
      this.items = this.items.slice(this.head);
      this.tail -= this.head;
      this.head = 0;
    }

    return item;
  }

  peek(): T {
    return this.items[this.head];
  }

  isEmpty(): boolean {
    return this.head === this.tail;
  }

  size(): number {
    return this.tail - this.head;
  }
}
