export type BoldASTNode = {
    type: "bold";
    data: ASTNode[];
};

export type ItalicASTNode = {
    type: "italic";
    data: ASTNode[];
};

export type StrikethroughASTNode = {
    type: "strikethrough";
    data: ASTNode[];
};

export type CodeASTNode = {
    type: "code";
    data: ASTNode[];
};

export type LinkASTNode = {
    type: "link";
    data: {
        text: ASTNode[];
        url: ASTNode[];
    };
};

export type TextASTNode = {
    type: "text";
    data: string;
};

export type ASTNode =
    | BoldASTNode
    | ItalicASTNode
    | StrikethroughASTNode
    | CodeASTNode
    | LinkASTNode
    | TextASTNode;

export type MatchResponse<T = ASTNode> =
    | {
          accepted: false;
      }
    | {
          accepted: true;
          nodes: T[];
          endCursor: number;
      };

export function normalizeTextNodes(nodes: ASTNode[]) {
    const out: ASTNode[] = [];

    let i = 0;
    while (i < nodes.length) {
        if (nodes[i].type === "text") {
            const outStr = [(nodes[i] as TextASTNode).data];
            let j = 1;
            while (nodes[i + j]?.type === "text") {
                outStr.push((nodes[i + j] as TextASTNode).data);
                j++;
            }
            out.push({
                type: "text",
                data: outStr.join(""),
            });
            i += outStr.length - 1;
        } else {
            out.push(nodes[i]);
        }
        i++;
    }
    return out;
}

export function normalize(nodes: ASTNode[]) {
    const out: ASTNode[] = [];

    for (const node of nodes) {
    }
}

/**
 * f
 * o
 * o
 * *
 * a
 * f
 */
