const MAGIC_COMMENT_PATTERN = /^\s*%?\s*!T[Ee]X\s*(\w+)\s*=\s*(.*)\s*$/;

const LATEX_COMMAND_PATTERN = /\\\w+(\\{|\w|\\}|\/|\\\]|\\\[)*/;

export function parse(document: string): Map<string, string> {
    const result: Map<string, string> = new Map();
    const lines = document.split('\n');
    for (const line of lines) {
        const latexCommandMatch = line.match(LATEX_COMMAND_PATTERN);
        if (latexCommandMatch) { break; } // Stop parsing if a latex command was found

        const match = line.match(MAGIC_COMMENT_PATTERN);
        if (match !== null) {
            result.set(match[1], match[2].trim());
        }
    }
    return result;
}