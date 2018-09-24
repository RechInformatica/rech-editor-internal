import Editor from "rech-editor-vscode";
import Matcher from "./matcher";
import * as fs from 'fs';

/**
 * Class for opening files on current line
 */
export default class FileOpener {

  /* Paths for file searching */
  private paths: string[];
  /* Mathcher for file pattern extraction */
  private matcher: Matcher;

  constructor() {
    this.paths = this.initializePaths();
    this.matcher = new Matcher();
  }

  /**
   * Initializes the available paths for file searching
   */
  private initializePaths() {
    var initialPaths: string[] = [""]; // Empty path for considering full path name
    return initialPaths;
  }

  /**
   * Adds path for file searchinf
   * 
   * @param path path to be added
   */
  public addPathForFileSearching(path: string) {
    this.paths.push(path);
  }

  /**
   * Opens file from current line
   */
  public openFromCurrentLine() {
    var editor = new Editor();
    var line = editor.getCurrentLine();
    this.matcher.getFilePathsFromLine(line).forEach((match) => {
      let resolvedPath = this.resolvePathForFile(match.file);
      editor.openFile(resolvedPath);
    });
  }

  /**
   * Resolves the path for the specified file
   * 
   * @param file target file
   */
  resolvePathForFile(file: string) {
    var resolvedPath = "";
    this.paths.forEach((currentPath) => {
      if (resolvedPath === "") {
        var fullPath = currentPath + file;
        if (fs.existsSync(fullPath)) {
          resolvedPath = fullPath;
        }
      }
    });
    return resolvedPath;
  }

};

