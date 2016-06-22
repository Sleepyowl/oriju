export interface INodeCallback<N, R> {
    /**
     * @param acc {Object[]} node's children transformation results
     * @param leaf {Object} current node
     * @returns transformation result
     */
    (acc: R[], node: N): R;
}

export interface ILeafCallback<L, R> {
    /**
     * @param leaf {Object} current leaf
     * @returns transformation result
     */
    (leaf: L): R;
}

export interface IChildrenSelector<N, L> {
    /**
     * @param node {Object} node
     * @returns {Object[]} array of children
     */
    (node: N): Array<N | L>;
}

/**
 * Tree utils
 */
export class Tree<N, L> {
    private selector: IChildrenSelector<N, L>;
    constructor(private root: N | L, childrenSelector: string | IChildrenSelector<N, L>) {
        this.selector = typeof childrenSelector === "string" ? (x: N) => x[childrenSelector] as Array<N | L> : childrenSelector;
        this.fold = this.reduce;
    }


    /**
     * Depth-first fold (reduce) of a multi-child tree
     * @param nodeCallback {Function} callback for nodes
     * @param leafCallback {Function} callback for leaves
     * @returns result of callback for root node
     */
    public fold<R>(nodeCallback: INodeCallback<N, R>, leafCallback: ILeafCallback<L, R>): R;

    /**
     * Depth-first fold (reduce) of a multi-child tree
     */
    public reduce<R>(nodeCallback: INodeCallback<N, R>, leafCallback: ILeafCallback<L, R>): R {
        // 1. Prepare depth-first queue
        const {selector, root} = this;
        const preQ = [root];
        const postQ: Array<N | L> = [];

        // preparing depth-first query
        while (preQ.length) {
            const current = preQ.pop();
            const children = selector(current as N);

            if (children && children.length) {
                preQ.push.apply(preQ, children);
            }

            postQ.push(current);
        }

        // 2. Walking depth-first queue
        const acc: R[] = [];
        for (let i = postQ.length - 1; i >= 0; i--) {
            const current = postQ[i];
            const children = selector(current as N);
            if (children instanceof Array) {
                const clen = children.length;
                const subtree_acc: R[] = clen ? acc.splice(-clen, clen) : [];

                acc.push(nodeCallback(subtree_acc, current as N));
            } else {
                acc.push(leafCallback(current as L));
            }
        }

        // 3. Sanity check & return
        if (acc.length === 1) {
            return acc[0];
        } else {
            throw `Something went wrong: subtree accumulator has ${acc.length - 1} leftover elements`;
        }
    }
}


export module Tree {    
    /**
     * Creates a multi-child tree from source
     * @param root {Object} root node
     * @param childrenSelector {string|Function} children array selector
     */
    export function from<N, L>(root: N | L, childrenSelector: string | IChildrenSelector<N, L>) {
        return new Tree<N, L>(root, childrenSelector);
    }
}

