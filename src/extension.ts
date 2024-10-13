import * as fs from "fs";
import { minimatch } from "minimatch";
import * as path from "path";
import * as vscode from "vscode";

/**
 * This method is called when the extension is activated.
 * It registers the "structure-generator.generateStructure" command.
 *
 * @param context - The context in which the extension is activated.
 */
export function activate(context: vscode.ExtensionContext) {
  // Output a message to the console when the extension is activated
  console.log(
    'Congratulations, your extension "structure-generator" is now active!'
  );

  // Register the command "structure-generator.generateStructure"
  let disposable = vscode.commands.registerCommand(
    "structure-generator.generateStructure",
    async () => {
      // Get the list of workspace folders
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage("No workspace is opened.");
        return;
      }

      // Get the path of the first workspace folder
      const workspacePath = workspaceFolders[0].uri.fsPath;

      // Get the configuration for this extension
      const config = vscode.workspace.getConfiguration("structureGenerator");
      const excludePatterns: string[] = config.get("exclude") || [];
      const includePatterns: string[] = config.get("include") || [];

      // Use the Progress API to show a progress notification
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Generating project structure...",
          cancellable: false,
        },
        async (progress) => {
          try {
            console.log("Starting project structure generation...");
            // Optionally, you can update progress here if you have multiple steps
            // progress.report({ increment: 0 });

            // Generate the directory structure as a string
            const structure = generateDirectoryStructure(
              workspacePath,
              excludePatterns,
              includePatterns
            );

            // Open a new text document with the directory structure
            const document = await vscode.workspace.openTextDocument({
              content: structure,
              language: "plaintext",
            });

            // Show the document to the user
            await vscode.window.showTextDocument(document, { preview: false });

            // Inform the user that the generation is done
            vscode.window.showInformationMessage(
              "Project structure generated successfully."
            );
            console.log("Project structure generation completed.");
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

  // Add the command to the extension's subscriptions
  context.subscriptions.push(disposable);
}

/**
 * This method is called when the extension is deactivated.
 */
export function deactivate() {}

/**
 * Interface representing a directory tree node.
 */
interface DirTree {
  name: string; // The name of the file or directory
  children?: DirTree[]; // Optional array of child nodes
}

/**
 * Generates the directory structure starting from a given path,
 * applying include and exclude patterns, and returns it as a formatted string.
 *
 * @param dirPath - The root directory path.
 * @param exclude - An array of glob patterns to exclude.
 * @param include - An array of glob patterns to include.
 * @returns The formatted directory structure as a string.
 */
export function generateDirectoryStructure(
  dirPath: string,
  exclude: string[],
  include: string[]
): string {
  // Initialize the directory tree with the root directory
  const tree: DirTree = {
    name: path.basename(dirPath),
    children: [],
  };

  // Build the directory tree recursively
  buildTree(dirPath, tree, exclude, include, "");

  // Format the directory tree into a string representation
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
function buildTree(
  currentPath: string,
  tree: DirTree,
  exclude: string[],
  include: string[],
  relativePath: string
) {
  // Read all items (files and directories) in the current directory
  const items = fs.readdirSync(currentPath, { withFileTypes: true });

  items.forEach((item) => {
    const itemPath = path.join(currentPath, item.name);
    const itemRelativePath = relativePath
      ? path.join(relativePath, item.name)
      : item.name;

    // Check if the item should be excluded based on the patterns
    if (shouldExclude(itemRelativePath, exclude, include)) {
      return;
    }

    // Create a new node for the item
    const node: DirTree = { name: item.name };
    if (item.isDirectory()) {
      node.children = [];

      // Recursively build the tree for the subdirectory
      buildTree(itemPath, node, exclude, include, itemRelativePath);
    }

    // Add the node to the current tree's children
    tree.children!.push(node);
  });
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
export function shouldExclude(
  filePath: string,
  exclude: string[],
  include: string[]
): boolean {
  // If there are include patterns, check if the file matches any
  if (include.length > 0) {
    const isIncluded = include.some((pattern) =>
      matchesPattern(filePath, pattern)
    );
    if (!isIncluded) {
      // Exclude the file if it doesn't match any include patterns
      return true;
    }
  }

  // If there are exclude patterns, check if the file matches any
  if (exclude.length > 0) {
    return exclude.some((pattern) => matchesPattern(filePath, pattern));
  }

  // Include the file by default
  return false;
}

/**
 * Checks if a file path matches a given glob pattern.
 *
 * @param filePath - The relative file path to test.
 * @param pattern - The glob pattern to match against.
 * @returns True if the file path matches the pattern, false otherwise.
 */
export function matchesPattern(filePath: string, pattern: string): boolean {
  return minimatch(filePath, pattern, { dot: true });
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
  // Start with the root directory name
  let result = isRoot ? `${prefix}${tree.name}/\n` : "";

  if (!tree.children) {
    return result;
  }

  const lastIndex = tree.children.length - 1;

  // Iterate over the child nodes
  tree.children.forEach((child, index) => {
    const isLast = index === lastIndex;
    // Choose the appropriate connector based on the position
    const connector = isLast ? "└── " : "├── ";
    // Update the prefix for child nodes
    const childPrefix = prefix + (isLast ? "    " : "│   ");

    // Add the current child to the result string
    result += `${prefix}${connector}${child.name}${
      child.children ? "/" : ""
    }\n`;

    // Recursively format the child node if it has children
    if (child.children) {
      result += formatTree(child, childPrefix, false);
    }
  });

  return result;
}
