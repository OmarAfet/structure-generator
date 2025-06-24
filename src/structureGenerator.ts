import * as path from "path";
import * as vscode from "vscode";
import { ConfigurationManager } from "./configuration";

export class StructureGenerator {
  constructor(private config: ConfigurationManager) { }

  async generate(rootPath: string): Promise<DirNode> {
    const rootName = path.basename(rootPath);
    const rootNode: DirNode = { name: rootName, children: [] };
    await this.buildTree(rootPath, rootNode, "");
    return rootNode;
  }

  private async buildTree(
    currentPath: string,
    parentNode: DirNode,
    relativePath: string
  ) {
    try {
      const entries = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(currentPath)
      );

      for (const [name, type] of entries) {
        const childRelPath = path.join(relativePath, name);
        if (this.config.shouldExclude(childRelPath)) {
          continue;
        }

        const childNode: DirNode = { name };

        if (type === vscode.FileType.Directory) {
          childNode.children = [];
          await this.buildTree(
            path.join(currentPath, name),
            childNode,
            childRelPath
          );
        } else {
          childNode.filePath = childRelPath;
          if (this.config.shouldShowFileContents()) {
            await this.addFileContent(childNode, path.join(currentPath, name), childRelPath);
          }
        }

        parentNode.children!.push(childNode);
      }
    } catch (error) {
      console.error(`Error processing ${currentPath}:`, error);
    }
  }
  private async addFileContent(node: DirNode, fullPath: string, relPath: string) {
    if (this.config.shouldExcludeContent(relPath)) {
      node.content = "// Content omitted (excluded by patterns)";
      return;
    }

    try {
      const content = await vscode.workspace.fs.readFile(vscode.Uri.file(fullPath));
      const maxSize = 1024 * 50; // 50KB

      if (this.config.shouldOmitLargeFiles() && content.length > maxSize) {
        node.content = `// File content omitted (exceeds 50KB limit)\n` + 
                      `// Disable in settings: 'structureGenerator.omitLargeFiles'`;
        return;
      }

      const contentString = Buffer.from(content).toString('utf8');
      node.content = contentString.length === 0 ? "// This file is empty" : contentString;
    } catch (error) {
      node.content = `// Error reading file: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}