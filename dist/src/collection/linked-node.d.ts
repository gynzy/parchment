interface LinkedNode {
    prev: LinkedNode | null;
    next: LinkedNode | null;
    domNode: any;
    children: any;
    length(): number;
}
export default LinkedNode;
