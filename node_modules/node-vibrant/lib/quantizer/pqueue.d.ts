export interface PQueueComparator<T> {
    (a: T, b: T): number;
}
export default class PQueue<T> {
    contents: T[];
    private _sorted;
    private _comparator;
    private _sort;
    constructor(comparator: PQueueComparator<T>);
    push(item: T): void;
    peek(index?: number): T;
    pop(): T;
    size(): number;
    map<U>(mapper: (item: T, index: number) => any): U[];
}
