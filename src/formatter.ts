import * as path from 'path';

export class Formatter {
  static format(node: DirNode): string {
    const structure = this.formatStructure(node);
    const contents = this.formatContents(node);
    return `${structure}${contents}`;
  }

  private static formatStructure(node: DirNode): string {
    const lines: string[] = [];
    this.formatStructureNode(node, "", true, lines);
    return lines.join("\n");
  }

  private static formatContents(node: DirNode): string {
    const blocks: string[] = [];
    this.collectContentBlocks(node, blocks);
    return blocks.length > 0 ? `\n\n${blocks.join("\n\n")}` : "";
  }

  private static collectContentBlocks(node: DirNode, blocks: string[]) {
    if (node.filePath && node.content) {
      if (node.content.includes("excluded by patterns")) {
        blocks.push(`${node.filePath}\n${node.content}\n` + 
          `// Adjust patterns in settings: 'structureGenerator.contentExclude'`);
      } else if (node.content.includes("50KB limit")) {
        blocks.push(`${node.filePath}\n${node.content}`);
      } else {
        const ext = path.extname(node.filePath).slice(1);
        blocks.push(`${node.filePath}\n\`\`\`${ext}\n${node.content}\n\`\`\``);
      }
    }
    node.children?.forEach(child => this.collectContentBlocks(child, blocks));
  }

  private static formatStructureNode(
    node: DirNode,
    prefix: string,
    isRoot: boolean,
    lines: string[]
  ) {
    if (isRoot) {
      lines.push(`${node.name}/`);
    }

    if (!node.children) {
      return;
    }

    const lastIdx = node.children.length - 1;
    node.children.forEach((child, idx) => {
      const isLast = idx === lastIdx;
      const connector = isLast ? "└── " : "├── ";
      const newPrefix = prefix + (isLast ? "    " : "│   ");

      lines.push(`${prefix}${connector}${child.name}${child.children ? "/" : ""}`);
      
      if (child.children) {
        this.formatStructureNode(child, newPrefix, false, lines);
      }
    });
  }
}
