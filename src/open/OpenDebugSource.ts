
import { Matcher } from "./Matcher";
import { Editor } from "rech-editor-cobol";
import { Scan } from "rech-ts-commons";
import * as fs from 'fs';

/**
 * Class for opening the debug version of a file
 */
export class OpenDebugSource {
  /* Current directory */
  private currentDir: string;
  /* Source file name */
  private fileName: string;

  constructor() {
    this.currentDir = new Editor().getCurrentFileDirectory()
    this.fileName = new Editor().getCurrentFileBaseName()
  }

  /**
   * Open the debug source and set cursor to the same line
   *
   */
  public open() {
    let originalLine = new Editor().getCurrentRow() + 1
    var debugFile = this.currentDir + this.getDebugDirectory() + this.fileName;
    if (fs.existsSync(debugFile)) {
      new Editor().openFile(debugFile, () => {
        new Editor().setCursor(this.getDebugLine(originalLine, new Editor().getEditorBuffer()), 120);
      })
    } else {
      new Editor().showWarningMessage("Fonte de debug não encontrado");
    }
  }

  /**
   * Returns the directory where debug sources are
   *
   */
  private getDebugDirectory(): string {
    if (this.currentDir.toLowerCase().includes("f:\\fontes")) {
      return "..\\SIGER\\DES\\src\\isCOBOL\\debug\\";
    }
    return "..\\src\\isCOBOL\\debug\\";
  }

  /**
   * Returns the current line on the debug source file
   *
   * @param line Current line
   * @param buffer Current source buffer
   */
  private getDebugLine(line: number, buffer: string): number {
    let regexp = new RegExp('\\*\\>\\s+\\d+\\s+(' + line + ')\\s+$', 'gm');
    let currentLine = 0;
    new Scan(buffer).scan(regexp, (iterator: any) => {
      currentLine = iterator.row;
      iterator.stop();
    });
    return currentLine;
  }
}