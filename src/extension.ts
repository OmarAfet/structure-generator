import { promises as fs } from "fs";
import { minimatch } from "minimatch";
import * as path from "path";
import * as vscode from "vscode";

/**
 * Activates the extension and registers the command.
 *
 * @param context - The context in which the extension is activated.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "structure-generator" is now active!');

  let disposable = vscode.commands.registerCommand(
    "structure-generator.generateStructure",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage("No workspace is opened.");
        return;
      }

      const workspacePath = workspaceFolders[0].uri.fsPath;
      const config = vscode.workspace.getConfiguration("structureGenerator");
      const excludePatterns: string[] = config.get("exclude") || [];
      const includePatterns: string[] = config.get("include") || [];
      const showPatterns: boolean = config.get("showPatterns") || false;

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Generating project structure...",
          cancellable: false,
        },
        async () => {
          try {
            const structure = await generateDirectoryStructure(
              workspacePath,
              excludePatterns,
              includePatterns
            );

            let finalOutput = "";

            if (showPatterns) {
              finalOutput += "### Exclude Patterns:\n";
              finalOutput +=
                excludePatterns.length > 0
                  ? excludePatterns.map((p) => `- \`${p}\``).join("\n") + "\n"
                  : "No exclude patterns specified.\n";

              finalOutput += "\n### Include Patterns:\n";
              finalOutput +=
                includePatterns.length > 0
                  ? includePatterns.map((p) => `- \`${p}\``).join("\n") + "\n"
                  : "No include patterns specified.\n";

              finalOutput +=
                "\n*You can disable this in `structureGenerator.showPatterns`*\n\n---\n\n";
            }

            finalOutput += structure;

            const document = await vscode.workspace.openTextDocument({
              content: finalOutput,
              language: "markdown",
            });

            await vscode.window.showTextDocument(document, { preview: false });
            vscode.window.showInformationMessage(
              "Project structure generated successfully."
            );
          } catch (error) {
            console.error("Error generating structure:", error);
            vscode.window.showErrorMessage(
              `Error generating structure: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

/**
 * Deactivates the extension.
 */
export function deactivate() {}

/**
 * Interface representing a directory tree node.
 */
interface DirTree {
  name: string;
  children?: DirTree[];
}

/**
 * Generates the directory structure as a formatted string.
 *
 * @param dirPath - The root directory path.
 * @param exclude - An array of glob patterns to exclude.
 * @param include - An array of glob patterns to include.
 * @returns The formatted directory structure as a string.
 */
async function generateDirectoryStructure(
  dirPath: string,
  exclude: string[],
  include: string[]
): Promise<string> {
  const tree: DirTree = {
    name: path.basename(dirPath),
    children: [],
  };

  await buildTree(dirPath, tree, exclude, include, "");

  return formatTree(tree);
}

/**
 * Recursively builds the directory tree structure.
 *
 * @param currentPath - The current directory path being traversed.
 * @param tree - The current node in the directory tree.
 * @param exclude - An array of glob patterns to exclude.
 * @param include - An array of glob patterns to include.
 * @param relativePath - The relative path from the root directory.
 */
async function buildTree(
  currentPath: string,
  tree: DirTree,
  exclude: string[],
  include: string[],
  relativePath: string
): Promise<void> {
  try {
    const items = await fs.readdir(currentPath, { withFileTypes: true });

    for (const item of items) {
      const itemName = item.name;
      const itemPath = path.join(currentPath, itemName);
      const itemRelativePath = relativePath
        ? path.join(relativePath, itemName)
        : itemName;

      if (shouldExclude(itemRelativePath, exclude, include)) {
        continue;
      }

      const node: DirTree = { name: itemName };
      if (item.isDirectory()) {
        node.children = [];
        await buildTree(itemPath, node, exclude, include, itemRelativePath);
      }

      tree.children!.push(node);
    }
  } catch (err) {
    console.error(`Error reading directory ${currentPath}:`, err);
  }
}

/**
 * Determines if a given file or directory should be excluded
 * based on the include and exclude patterns.
 *
 * @param filePath - The relative file path to test.
 * @param exclude - An array of glob patterns to exclude.
 * @param include - An array of glob patterns to include.
 * @returns True if the file should be excluded, false otherwise.
 */
function shouldExclude(
  filePath: string,
  exclude: string[],
  include: string[]
): boolean {
  if (include.length > 0) {
    const isIncluded = include.some((pattern) =>
      minimatch(filePath, pattern, { dot: true })
    );
    if (!isIncluded) {
      return true;
    }
  }

  if (exclude.length > 0) {
    return exclude.some((pattern) =>
      minimatch(filePath, pattern, { dot: true })
    );
  }

  return false;
}

/**
 * Formats the directory tree into a string with visual connectors.
 *
 * @param tree - The directory tree to format.
 * @param prefix - The prefix to use for the current level (used in recursion).
 * @param isRoot - Flag indicating if the current node is the root.
 * @returns The formatted directory tree as a string.
 */
function formatTree(
  tree: DirTree,
  prefix: string = "",
  isRoot: boolean = true
): string {
  const lines: string[] = [];
  if (isRoot) {
    lines.push(`${tree.name}/`);
  }

  if (!tree.children) {
    return lines.join("\n");
  }

  const lastIndex = tree.children.length - 1;

  tree.children.forEach((child, index) => {
    const isLast = index === lastIndex;
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = prefix + (isLast ? "    " : "│   ");
    lines.push(
      `${prefix}${connector}${child.name}${child.children ? "/" : ""}`
    );

    if (child.children) {
      lines.push(formatTree(child, childPrefix, false));
    }
  });

  return lines.join("\n");
}
