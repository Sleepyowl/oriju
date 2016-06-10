import {Tree} from "./Tree";
import {expect} from "chai";

describe("Tree", function () {
    describe("reduce", function () {
        it("makes simple conversion (initial test)", function () {
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
            const result =
                Tree.from(filter, "filters").fold<any, any>(
                    (acc, node: any) => ({
                        bool: {
                            [node.logic == "or" ? "should" : "must"]: acc
                        }
                    }),
                    (leaf: any) => ({
                        // for simplicity, assuming operator to be always "eq"
                        term: { [leaf.field]: leaf.value }
                    })
                );

            expect(result).to.eql({
                bool: {
                    must: [
                        {
                            bool: {
                                should: [
                                    {term: {position: "QA Engineer"}},
                                    {term: {position: "UX Engineer"}}
                                ]
                            }
                        },
                        { term: { age: "20" } }
                    ]
                }
            });
        });
    });
});