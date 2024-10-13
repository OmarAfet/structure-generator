# Change Log

All notable changes to the [Structure Generator extension](https://marketplace.visualstudio.com/items?itemName=OmarAfet.structure-generator) will be documented in this file.

## [1.1.0] - 2024-10-13

### Added

- Introduced `structureGenerator.showPatterns` setting (default: `true`), allowing users to display the include and exclude patterns at the top of the generated structure.
- Users also can disable this feature via settings.

### Changed

- Replaced synchronous `fs` operations with asynchronous `fs.promises` methods, improving overall performance and reducing potential blocking during large directory scans.
- Enhanced formatting of the directory structure output to show visual connectors more clearly.
- Improved and simplified logging to the console during activation and structure generation.
- Cleaned up and removed redundant comments in the code for better readability.

## [1.0.8] - 2024-10-13

Recreate the Extension with npm instead of pnpm.

## [1.0.7] - 2024-10-13

Recreate the Extension with esbuild & pnpm instead of webpack.

## [1.0.6] - 2024-10-13

### Added

- Introduced a unified `build` script in `package.json` that compiles TypeScript and bundles the extension using webpack.
- Added `webpack`, `webpack-cli`, `ts-loader`, and `typescript` as dependencies to support the new build process.

### Changed

- Updated `prepublish` and `pretest` scripts in `package.json` to utilize the new `build` script instead of separate `compile` and `webpack` scripts.
- Removed redundant `compile` and `webpack` scripts from `package.json` to streamline the build process.
- Cleaned up `webpack.config.js` by removing unnecessary comments for better readability.

## [1.0.5] - 2024-09-22

### Added

- Introduced progress notification using VS Code's Progress API when generating the project structure.
- Added a new `webpack` script to `package.json` for production bundling.
- Integrated the `webpack` step into the `pretest` script to ensure the project is compiled and bundled before running tests.
- Console logs for tracking the start and completion of project structure generation.

### Changed

- Enhanced error handling in the directory structure generation, including better error messages and console logging.
- Refined `webpack.config.js` by removing unnecessary comments and simplifying configuration.

## [1.0.4] - 2024-09-21

### Fixed

- Attempted to fix the issue with the `structure-generator.generateStructure` not found error, but the problem persists.

## [1.0.3] - 2024-09-21

### Added

- Webpack support:
  - Added `webpack`, `webpack-cli`, and `@types/webpack` as dependencies.
  - Included a `postinstall` script to run VSCode extension installation.

### Changed

- `tsconfig.json`:
  - Added `webpack` types to `types` array.
- `webpack.config.js`:
  - Output directory changed from `dist` to `out`.
  - Standardized quote styles and cleaned up formatting.
  - Source map generation remains enabled (`nosources-source-map`).

## [1.0.2] - 2024-09-21

### Changed

- Updated extension logic and documentation.
- Updated the `README.md` with detailed installation instructions, enhanced usage guide, and new configuration examples.
- Updated `package.json` to version `1.0.2`, refined command title and default include/exclude patterns.
- Refactored the `extension.ts`:
  - Added comments to improve code readability.
  - Replaced custom glob matching logic with `minimatch`.
  - Enhanced the `buildTree` function for better handling of file system traversal and filtering.
  - Improved formatting of directory structure output with visual connectors.

### Removed

- Removed `.gitignore` file.
