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

export function normalizeTextNodes(nodes: ASTNode[]): ASTNode[] {
    let currentTextNode: TextASTNode | undefined;
    function combineTextNode(node: TextASTNode) {
        if (!currentTextNode) {
            currentTextNode = {
                type: "text",
                data: "",
            };
        }
        currentTextNode.data += node.data;
    }

    const out: ASTNode[] = [];

    for (let node of nodes) {
        if (node.type === "text") {
            combineTextNode(node);
        } else {
            if (currentTextNode) {
                out.push(currentTextNode);
                currentTextNode = undefined;
            }

            if (node.type === "link") {
                const link: LinkASTNode = {
                    type: "link",
                    data: {
                        text: normalizeTextNodes(node.data.text),
                        url: normalizeTextNodes(node.data.url),
                    },
                };
                out.push(link);
            } else {
                const _node:
                    | BoldASTNode
                    | ItalicASTNode
                    | StrikethroughASTNode
                    | CodeASTNode = {
                    type: node.type,
                    data: normalizeTextNodes(node.data),
                };

                out.push(_node);
            }
        }
    }

    if (currentTextNode) {
        out.push(currentTextNode);
    }

    return out;
}
