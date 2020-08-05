import { Editor, Path, File } from "rech-editor-cobol";
import { Matcher } from "./Matcher";
import { WorkingCopy } from "../wc/WorkingCopy";
import { Scan } from "rech-ts-commons";

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
    extensions.push(".java");
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
    const editor = new Editor();
    const lineText = editor.getCurrentLine();
    const column = editor.getCurrentColumn();
    let opened = this.openFromText(this.getCurrentFileFromCursor(lineText, column));
    if (!opened) {
      opened = this.openFromText(this.retrieveSelectionOrFullLine());
    }
    if (!opened) {
      this.openInImportPropertiesFromText(this.getCurrentFileFromCursor(lineText, column))
    }
  }

  /**
   * Tries to open file in the import.properties from specified text
   *
   * @param text text to try to find a valid file on import.properties
   */
  private openInImportPropertiesFromText(text: string): boolean {
    let sucess = false;
    let match  = /([a-zA-Z0-9]+)/.exec(text);
    if (match && match.length > 1) {
      text = match[1]
      let importPropertiesFile = new File(WorkingCopy.currentSync().getEtcDir() + "import.properties");
      if (!importPropertiesFile.exists()) {
        importPropertiesFile = new File("F:\\siger\\des\\etc\\import.properties");
      }
      let importProperties = importPropertiesFile.loadBufferSync("latin1");
      let importPattern = new RegExp(text + "\\=" + "([^\\s]+)");
      new Scan(importProperties).scan(importPattern, (iterator: any) => {
        this.openRegexFromCurrentLine(iterator.lineContent.toString(), importPattern, 1)
        iterator.stop();
        sucess = true;
      });
    }
    return sucess;
  }

  /**
   * Tries to open file from the specified text
   *
   * @param text text to try to find a valid file
   */
  private openFromText(text: string): boolean {
    if (this.openRegexFromCurrentLine(text, /([A-Z]:)?([^:\s\*\?\"\(\'\<\>\|]+\.\w+)(:\d+|,\sline\s=\s\d+)?(,\scol\s\d+)?/gi, 0)) {
      return true;
    }
    if (this.openRegexFromCurrentLine(text, / *CALL +(?:CLIENT +|RUN +)*"([^"]+)"/gi, 1)) {
      return true;
    }
    if (this.openRegexFromCurrentLine(text, / *CANCEL +(?:CLIENT +)?\"([^"]+)\"/gi, 1)) {
      return true;
    }
    if (this.openRegexFromCurrentLine(text, / *INVOKE +([^ ]+)/gi, 1)) {
      return true;
    }
    if (this.openRegexFromCurrentLine(text, / *CLASS [A-Za-z0-9]+ AS \"([^ ]+)\"/gi, 1)) {
      return true;
    }
    return false;
  }

  /**
   * Opens the file from current line after executing the specified regular expression
   *
   * @param text line text
   * @param regex regular expression to be executed
   * @param resultIndex regular expression result index
   */
  private openRegexFromCurrentLine(text: string, regex: RegExp, resultIndex: number): boolean {
    var matches = this.matcher.getFilePathsFromLine(text, regex);
    if (matches && matches.length > resultIndex) {
      var match = matches[resultIndex];
      let resolvedPath = this.resolvePathForFile(match.file);
      if (resolvedPath !== "") {
        new Editor().openFileInsensitive(resolvedPath, () => {
          new Editor().setCursor(match.row - 1, match.column);
        });
        return true;
      }
    }
    return false;
  }

  /**
   * Retrieves filename from location where cursor is positioned
   */
  public getCurrentFileFromCursor(lineText: string, column: number): string {
    const delimiters = [" ", "<", ">", "&", "'", "(", ")", ";", ","];
    let fileName = "";
    let leftSideDelimiter = 0;
    for (let i = 0; i < column; i++) {
      const currentChar = lineText.charAt(i);
      if (this.containsAnyDelimiter(currentChar, delimiters)) {
        leftSideDelimiter = i + 1;
      }
    }
    let rightSideDelimiter;
    for (rightSideDelimiter = column; rightSideDelimiter < lineText.length; rightSideDelimiter++) {
      const currentChar = lineText.charAt(rightSideDelimiter);
      if (this.containsAnyDelimiter(currentChar, delimiters)) {
        break;
      }
    }
    fileName = lineText.substring(leftSideDelimiter, rightSideDelimiter);
    return fileName;
  }

  /**
   * Returns true if the current character of the line is a delimiter
   *
   * @param char current line character
   * @param delimiters delimiters array
   */
  private containsAnyDelimiter(char: string, delimiters: string[]): boolean {
    for (var i = 0; i != delimiters.length; i++) {
      var currentDelimiter = delimiters[i];
      if (char === currentDelimiter) {
        return true;
      }
    }
    return false;
  }

  /**
   * Retrieves the selected text or the full line text if nothing is selected
   */
  private retrieveSelectionOrFullLine() {
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
          } else {
            let fileWithBars = file.replace(/\./g, "\\")
            var currentFile: File = new File(currentPath + fileWithBars + extension);
            if (currentFile.exists()) {
              resolvedPath = currentFile.fileName;
            }
          }
        });
      }
    });
    return resolvedPath;
  }

}
