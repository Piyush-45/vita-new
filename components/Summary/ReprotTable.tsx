// // components/ReportTable.tsx
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Card, CardContent } from "@/components/ui/card";

// export function ReportTable({ markdown }: { markdown: string }) {
//     return (
//         <Card className="my-6">
//             <CardContent>
//                 <ReactMarkdown
//                     remarkPlugins={[remarkGfm]}
//                     // className="prose max-w-none"
//                     components={{
//                         table: props => (
//                             <table className="w-full border border-muted rounded-lg my-4 text-sm" {...props} />
//                         ),
//                         th: props => (
//                             <th className="bg-muted px-3 py-2 border font-medium text-muted-foreground" {...props} />
//                         ),
//                         td: props => (
//                             <td className="px-3 py-2 border" {...props} />
//                         ),
//                     }}
//                 >
//                     {markdown}
//                 </ReactMarkdown>
//             </CardContent>
//         </Card>
//     )
// }



// components/ReportTable.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";
import clsx from "clsx";

function parseRange(range: string) {
    // Handles "13 - 17", "140 - 200", "0.7 - 1.3", etc.
    const match = range.match(/([0-9.]+)\s*-\s*([0-9.]+)/);
    if (!match) return [null, null];
    return [parseFloat(match[1]), parseFloat(match[2])];
}

function extractNumber(value: string) {
    const match = value.replace(",", "").match(/-?\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
}

function isAbnormal(result: string, refRange: string) {
    const [low, high] = parseRange(refRange);
    const num = extractNumber(result);

    if (num === null || low === null || high === null) return false;
    return num < low || num > high;
}

export function ReportTable({ markdown }: { markdown: string }) {
    // We'll track which column is "Result" and which is "Range" using header row
    const [resultCol, rangeCol] = [1, 2]; // Default positions after parsing markdown

    return (
        <Card className="my-6">
            <CardContent>
                <div className="prose max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h2: ({ children, ...props }) => (
                                <h2
                                    className="text-2xl font-bold my-4"
                                    style={{ color: "#0D9488" /* teal */ }}
                                    {...props}
                                >
                                    {children}
                                </h2>
                            ),
                            h3: ({ children, ...props }) => (
                                <h3
                                    className="text-xl font-bold mb-2"
                                    style={{ color: "#2563EB" /* blue */ }}
                                    {...props}
                                >
                                    {children}
                                </h3>
                            ),
                            table: (props) => (
                                <table className="w-full border border-muted rounded-lg my-4 text-sm" {...props} />
                            ),
                            th: ({ children, ...props }) => (
                                <th
                                    className="bg-slate-200 px-3 py-2 border font-semibold text-slate-700"
                                    {...props}
                                >
                                    {children}
                                </th>
                            ),
                            tr: ({ children, ...props }) => (
                                <tr className="even:bg-slate-50" {...props}>
                                    {children}
                                </tr>
                            ),
                            td: ({ node, children, ...props }) => {
                                // Get current row (passed via node)
                                let shouldHighlight = false;

                                try {
                                    // parent is <tr>; grandparent is <tbody>
                                    if (
                                        node.parent &&
                                        node.parent.children &&
                                        Array.isArray(node.parent.children)
                                    ) {
                                        // We'll find the result and range columns in the current row
                                        const rowChildren = node.parent.children;
                                        let resultVal = "";
                                        let refRange = "";

                                        if (
                                            rowChildren[resultCol] &&
                                            rowChildren[rangeCol] &&
                                            rowChildren !== undefined
                                        ) {
                                            // Get text value from children (string or nested array)
                                            // The value check is applied only to Result columns
                                            if (
                                                props &&
                                                props["data-index"] === resultCol
                                            ) {
                                                resultVal = rowChildren[resultCol].children[0]?.value ?? "";
                                                refRange = rowChildren[rangeCol].children[0]?.value ?? "";
                                                if (
                                                    resultVal &&
                                                    refRange &&
                                                    isAbnormal(resultVal, refRange)
                                                ) {
                                                    shouldHighlight = true;
                                                }
                                            }
                                        }
                                    }
                                } catch {
                                    /* silent fallback */
                                }

                                return (
                                    <td
                                        className={clsx(
                                            "px-3 py-2 border",
                                            shouldHighlight && "text-red-600 font-bold"
                                        )}
                                        {...props}
                                    >
                                        {children}
                                    </td>
                                );
                            },
                        }}
                    >
                        {markdown}
                    </ReactMarkdown>
                </div>
            </CardContent>
        </Card>
    );
}

