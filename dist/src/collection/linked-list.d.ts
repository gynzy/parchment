import LinkedNode from './linked-node';
import { Parent } from '../blot/abstract/blot';
declare class LinkedList<T extends LinkedNode> {
    head: T | null;
    tail: T | null;
    length: number;
    constructor();
    append(...nodes: T[]): void;
    contains(node: T): boolean;
    insertBefore(node: T | null, refNode: T | null): void;
    offset(target: T): number;
    remove(node: T): void;
    iterator(curNode?: T | null): () => T | Parent | null;
    find(index: number, inclusive?: boolean, includeBreak?: boolean): [T | null, number];
    forEach(callback: (cur: T) => void): void;
    forEachAt(index: number, length: number, callback: (cur: T, offset: number, length: number) => void, includeBreak?: boolean): void;
    map(callback: (cur: T | null) => any): any[];
    reduce<M>(callback: (memo: M, cur: T) => M, memo: M): M;
}
export default LinkedList;
