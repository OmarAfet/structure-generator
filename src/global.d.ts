interface DirNode {
  name: string;
  children?: DirNode[];
  filePath?: string;
  content?: string;
}