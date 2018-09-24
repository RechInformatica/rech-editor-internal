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
  openFromCurrentLine() {
    var text = this.retrieveTargetText();
    var matches = this.matcher.getFilePathsFromLine(text);
    if (matches && matches.length > 0) {
      var match = matches[0];
      let resolvedPath = this.resolvePathForFile(match.file);
      // Opens the specified file
      new Editor().openFile(resolvedPath, () => {
        new Editor().setCursor(match.row - 1, match.column);
      });
    }
  }

  /**
   * Retrieves the target text for the filename extraction
   */
  private retrieveTargetText() {
     var editor = new Editor();
     var selection = editor.getSelectionBuffer();
     if (selection && selection.length > 0 && selection[0] !== "") {
       return selection[0];
     }
     return editor.getCurrentLine();
  }

  /**
   * Resolves the path for the specified file
   * 
   * @param file target file
   */
  private resolvePathForFile(file: string) {
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


