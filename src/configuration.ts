import { Minimatch, minimatch } from "minimatch";
import * as vscode from "vscode";

export class ConfigurationManager {
  private compiledExclude: Minimatch[];
  private compiledInclude: Minimatch[];
  private compiledContentExclude: Minimatch[];
  private showPatterns: boolean;
  private showFileContents: boolean;
  private omitLargeFiles: boolean;

  constructor() {
    const config = vscode.workspace.getConfiguration("structureGenerator");
    const exclude = config.get<string[]>("exclude") || [];
    const include = config.get<string[]>("include") || [];
    const contentExclude = config.get<string[]>("contentExclude") || [];

    this.showPatterns = config.get<boolean>("showPatterns") || false;
    this.compiledExclude = this.compilePatterns([...exclude]);
    this.compiledInclude = this.compilePatterns(include);
    this.compiledContentExclude = this.compilePatterns(contentExclude);
    this.showFileContents = config.get<boolean>("showFileContents") || false;
    this.omitLargeFiles = config.get<boolean>("omitLargeFiles") ?? true;
  }

  private compilePatterns(patterns: string[]): Minimatch[] {
    return patterns.map(p => new minimatch.Minimatch(p, { dot: true }));
  }

  shouldExclude(path: string): boolean {
    if (this.compiledInclude.length > 0 &&
      !this.compiledInclude.some(m => m.match(path))) {
      const isParentOfIncluded = this.compiledInclude.some(m => {
        const pattern = m.pattern;
        const normalizedPath = path.replace(/\\/g, '/');
        const normalizedPattern = pattern.replace(/\\/g, '/');
        return normalizedPattern.startsWith(normalizedPath + '/');
      });
      if (!isParentOfIncluded) {
        return true;
      }
    }
    return this.compiledExclude.some(m => m.match(path));
  }

  shouldExcludeContent(filePath: string): boolean {
    return this.compiledContentExclude.some(m => m.match(filePath));
  }

  getExcludePatterns(): string[] {
    return this.compiledExclude.map(m => m.pattern);
  }

  getIncludePatterns(): string[] {
    return this.compiledInclude.map(m => m.pattern);
  }

  shouldShowPatterns(): boolean {
    return this.showPatterns;
  }

  shouldShowFileContents(): boolean {
    return this.showFileContents;
  }

  shouldOmitLargeFiles(): boolean {
    return this.omitLargeFiles;
  }
}
