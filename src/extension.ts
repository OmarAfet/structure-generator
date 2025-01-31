import * as vscode from "vscode";
import { ConfigurationManager } from "./configuration";
import { Formatter } from "./formatter";
import { StructureGenerator } from "./structureGenerator";

/**
 * Activates the extension and registers the command.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "structure-generator" is now active!');

  const disposable = vscode.commands.registerCommand(
    "structure-generator.generateStructure",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage("No workspace opened.");
        return;
      }

      const workspaceFolder = await selectWorkspaceFolder(workspaceFolders);
      if (!workspaceFolder) {
        return;
      }

      const configManager = new ConfigurationManager();
      const structureGenerator = new StructureGenerator(configManager);
      const formatter = new Formatter();

      await generateStructure(
        workspaceFolder.uri.fsPath,
        configManager,
        structureGenerator,
        formatter
      );
    }
  );

  context.subscriptions.push(disposable);
}

async function selectWorkspaceFolder(
  folders: readonly vscode.WorkspaceFolder[]
): Promise<vscode.WorkspaceFolder | undefined> {
  return folders.length === 1
    ? folders[0]
    : vscode.window.showWorkspaceFolderPick();
}

async function generateStructure(
  workspacePath: string,
  configManager: ConfigurationManager,
  structureGenerator: StructureGenerator,
  formatter: Formatter
) {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Generating project structure...",
      cancellable: false,
    },
    async () => {
      try {
        const tree = await structureGenerator.generate(workspacePath);
        const output = buildOutput(configManager, tree);
        await showOutputDocument(output);
      } catch (error) {
        handleError(error);
      }
    }
  );
}

function buildOutput(
  configManager: ConfigurationManager,
  tree: DirNode
): string {
  let output = "";
  if (configManager.shouldShowPatterns()) {
    output += buildPatternsSection(configManager);
  }
  output += Formatter.format(tree); // Call static method directly
  return output;
}

function buildPatternsSection(configManager: ConfigurationManager): string {
  const exclude = configManager.getExcludePatterns();
  const include = configManager.getIncludePatterns();

  return `## Exclusion/Inclusion Patterns
### Exclude Patterns:
${formatPatterns(exclude)}
### Include Patterns:
${formatPatterns(include)}
*Configure in settings (structureGenerator.exclude/include)*
---
`;
}

function formatPatterns(patterns: string[]): string {
  return patterns.length > 0
    ? patterns.map(p => `- \`${p}\``).join("\n")
    : "No patterns specified";
}

async function showOutputDocument(content: string) {
  const doc = await vscode.workspace.openTextDocument({
    content,
    language: "markdown",
  });
  await vscode.window.showTextDocument(doc, { preview: false });
  vscode.window.showInformationMessage("Structure generated successfully");
}

function handleError(error: unknown) {
  console.error("Error:", error);
  const message = error instanceof Error ? error.message : String(error);
  vscode.window.showErrorMessage(`Error generating structure: ${message}`);
}

export function deactivate() { }