# **Structure Generator**

A Visual Studio Code extension that helps you generate and visualize your workspace's directory structure with advanced filtering and content display options.

## Features

- **Directory Structure Generation:** Create a clear, textual representation of your project's directory structure in seconds
- **File Content Display:** Optionally show file contents below the structure with syntax highlighting (enabled via settings)
- **Smart Content Handling:** 
  - Automatic omission of large files (>50KB) with guidance messages
  - Configurable content exclusion patterns
- **Customizable Filters:** Use flexible include/exclude patterns to control visibility
- **Pattern Visibility:** Show include/exclude patterns in output (default enabled)
- **High Performance:** Optimized for large projects with async operations

## Installation

You can install **Structure Generator** via the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=OmarAfet.structure-generator), or by searching for "Structure Generator" within the VS Code Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X` on macOS).

## Usage

1. Open the workspace/folder in VS Code
2. Configure settings (optional):
   - Open **Settings** (`Ctrl + ,` or `Cmd + ,`)
   - Navigate to **Extensions** > **Structure Generator**
   - Adjust patterns, content display, and omission settings
3. Open **Command Palette** (`Ctrl + Shift + P`/`Cmd + Shift + P`)
4. Run `Structure Generator: Generate Project Structure`
5. Review generated structure with optional content

## Configuration

### Core Settings

```json
"structureGenerator.exclude": [
  "node_modules", // Exclude the node_modules directory
  "**/.*" // Exclude hidden files and directories
],
"structureGenerator.include": [
  "src/**" // Include everything within the "src" directory (parent directories automatically included)
]
"structureGenerator.showPatterns": true
```

### Content Display Settings

```json
"structureGenerator.showFileContents": false,
"structureGenerator.omitLargeFiles": true,
"structureGenerator.contentExclude": [
  "**/package-lock.json",
  "**/*.min.*",
  "**/dist/**"
]
```

### Settings Explained

1. **showFileContents** - Enable file content display (default: false)
2. **omitLargeFiles** - Skip files >50KB (default: true)
3. **contentExclude** - Patterns for files to exclude from content display

## Example Output

![image](https://github.com/user-attachments/assets/bbbeb833-86e9-4e20-80ec-ede24587574a)