export class Tree<N> {
    constructor(private root: N, private childrenField: string) {
    }

    /**
     * Depth-first fold (reduce) of a multi-child tree
     */
    public reduce<L, R>(nodeCallback: (acc: R[], node: N) => R, leafCallback: (leaf: L) => R) {
        // 1. Prepare depth-first queue
        const {childrenField, root} = this;
        const preQ = [root];
        const postQ: Array<N | L> = [];

        // preparing depth-first query
        while (preQ.length) {
            const current = preQ.pop();
            const children = current[childrenField];

            if (children && children.length) {
                preQ.push.apply(preQ, children);
            }

            postQ.push(current);
        }

        // 2. Walking depth-first queue
        const acc = [];
        for (let i = postQ.length - 1; i >= 0; i--) {
            const current = postQ[i];
            const children = current[childrenField];
            if (children instanceof Array) {
                const clen = children.length;
                const subtree_acc = clen ? acc.splice(-clen, clen) : [];

                acc.push(nodeCallback(subtree_acc, current as N));
            } else {
                acc.push(leafCallback(current as L));
            }
        }

        // 3. Sanity check & return
        if(acc.length === 1){
            return acc[0];
        } else {
            throw `Something went wrong: accumulator has ${acc.length - 1} leftover elements`;
        }
    }

    public fold = this.reduce;
}

export module Tree {
    export function from(root: Object, childrenField: string) {
        return new Tree(root, childrenField);
    }
}

