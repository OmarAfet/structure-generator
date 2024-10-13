# **Structure Generator**

A Visual Studio Code extension that helps you generate and visualize your workspace's directory structure based on customizable include and exclude patterns.

## Features

- **Directory Structure Generation:** Create a clear, textual representation of your project's directory structure in seconds.
- **Customizable Filters:** Use flexible include and exclude patterns to control which files and directories are shown.
- **Display Include/Exclude Patterns:** Optionally show the include and exclude patterns at the top of the generated structure for easy reference (can be disabled via settings).
- **High Performance:** Optimized for handling even large projects quickly and efficiently.

## Installation

You can install **Structure Generator** via the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=OmarAfet.structure-generator), or by searching for "Structure Generator" within the VS Code Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X` on macOS).

## Usage

1. Open the workspace or folder you want to analyze in VS Code.
2. (Optional) Adjust the include and exclude patterns to customize the output:
   - Open **Settings** (`Ctrl + ,` or `Cmd + ,` on macOS).
   - Navigate to **Extensions** > **Structure Generator**.
   - Modify the **Exclude**, **Include**, and **Show Patterns** settings as required.
3. Open the **Command Palette** (`Ctrl + Shift + P` or `Cmd + Shift + P` on macOS).
4. Type `Structure Generator: Generate Project Structure` and press `Enter`.
5. The generated directory structure will be displayed in a new text document based on your current configuration.

## Configuration

You can configure **Structure Generator** using glob patterns to include or exclude specific files and directories.

### Default Exclude & Include Patterns:

```json
"structureGenerator.exclude": [
  "node_modules", // Exclude the node_modules directory
  "**/.*" // Exclude hidden files and directories
],
"structureGenerator.include": [
  "src/**", // Include everything within the "src" directory
  "src" // Ensure the "src" directory itself is included
]
```

### Show Patterns

The extension can display the include and exclude patterns at the top of the generated structure. This is controlled by the `structureGenerator.showPatterns` setting, which defaults to `true`.

You can disable this feature in the settings:

```json
"structureGenerator.showPatterns": false
```

When enabled, the patterns will be shown in the output as follows:

```markdown
### Exclude Patterns:

- `node_modules`
- `**/.*`

### Include Patterns:

- `src/**`
- `src`

_You can disable this in `structureGenerator.showPatterns`_

---
```

Example Output:

![image](https://github.com/user-attachments/assets/fe14ebc5-fcb2-473a-9901-e2e294d21a4e)
