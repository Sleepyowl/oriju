
#OriJu

##What's that?

It's `reduce()` for binary or 'normal' trees.

##What do one use that for?

It's intended to be used to traverse and transform trees in a functional fashion as an alternative to visitor pattern and such.

##Example?

```typescript
import {Tree} from "oriju";

// filter in the format of a popular UI library
const filter = {
    logic: "and",
    filters: [
        {
            logic: "or",
            filters: [
                {
                    operator: "eq",
                    field: "position",
                    value: "QA Engineer"
                },
                {
                    operator: "eq",
                    field: "position",
                    value: "UX Engineer"
                }
            ]
        },
        {
            operator: "eq",
            field: "age",
            value: "20"
        }
    ]
};

// translating it to elasticsearch QueryDSL
Tree.from(filter, "filters").fold(
        (acc, node)=>({
            bool: {
                [node.logic == "or" ? "should" : "must"]: acc
            }}), 
        (leaf)=>({
            // for simplicity, assuming operator to be always "eq"
            term: {[leaf.field]: leaf.value}
        })
);
```


