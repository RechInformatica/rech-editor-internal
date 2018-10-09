import { Editor, Path, File } from "rech-editor-vscode";
import { Matcher } from "./matcher";
import * as fs from 'fs';

/**
 * Class for opening files on current line
 */
export class FileOpener {

  /* Mathcher for file pattern extraction */
  private matcher: Matcher;
  /* Paths for file searching */
  private paths: string[];
  /* Default extensions used when the Regular Expression matches a file with no extension specified */
  private defaultExtensions: string[];

  constructor() {
    this.matcher = new Matcher();
    this.paths = this.initializePaths();
    this.defaultExtensions = this.initializeDefaultExtensions();
  }

  /**
   * Initializes the available paths for file searching
   */
  private initializePaths() {
    var initialPaths: string[] = [];
    initialPaths.push("");    // Empty path for considering full path name
    initialPaths.push(new Editor().getCurrentFileDirectory()); // Current directory
    return initialPaths;
  }

  /**
   * Initializes the default extensions used when the Regular Expression matches a file with no extension specified
   */
  private initializeDefaultExtensions() {
    var extensions: string[] = [];
    extensions.push("");
    extensions.push(".CBL");
    return extensions;
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
    this.openRegexFromCurrentLine(text, /([A-Z]:)?([^:\s\*\?\"\'\<\>\|]+\.\w+)(:\d+)?/gi, 0);
    this.openRegexFromCurrentLine(text, / *CALL +"([^"]+)"/gi, 1);
    this.openRegexFromCurrentLine(text, / *CANCEL +\"([^"]+)\"/gi, 1);
  }

  /**
   * Opens the file from current line after executing the specified regular expression
   * 
   * @param text line text
   * @param regex regular expression to be executed
   * @param resultIndex regular expression result index 
   */
  private openRegexFromCurrentLine(text: string, regex: RegExp, resultIndex: number) {
    var matches = this.matcher.getFilePathsFromLine(text, regex);
    if (matches && matches.length > resultIndex) {
      var match = matches[resultIndex];
      let resolvedPath = this.resolvePathForFile(match.file);
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
        this.defaultExtensions.forEach((extension) => {
          var currentFile: File = new File(currentPath + file + extension);
          if (currentFile.exists()) {
            resolvedPath = currentFile.fileName;
          }
        });
      }
    });
    return resolvedPath;
  }

};