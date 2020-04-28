
import { Matcher } from "./Matcher";
import { Editor } from "rech-editor-cobol";
import { Scan } from "rech-ts-commons";
import * as fs from 'fs';
import path from "path";
/**
 * Class for opening the debug version of a file
 */
export class OpenDebugSource {
  /* Current directory */
  private currentDir: string;
  /* Source file name */
  private fileName: string;
  /* Source extension */
  private extension: string;

  constructor() {
    this.currentDir = new Editor().getCurrentFileDirectory()
    this.fileName = new Editor().getCurrentFileBaseName()
    this.extension = new Editor().getCurrentFileBaseNameExtension()
  }

  /**
   * Open the debug source and set cursor to the same line
   *
   */
  public open() {
    let originalLine = new Editor().getCurrentRow() + 1
    var debugFile = path.normalize(this.currentDir + this.getDebugDirectory() + this.fileName);
    if (fs.existsSync(debugFile)) {
      new Editor().openFile(debugFile, () => {
        new Editor().setCursor(this.getDebugLine(originalLine, new Editor().getEditorBuffer()), 120);
      })
    } else {
      if (this.extension.toUpperCase() == "CPY" || this.extension.toUpperCase() == "CPB") {
        new Editor().showWarningMessage("Não é possivel utilizar o comando em copy. Utilize no programa onde o copy está declarado.");
      } else {
        new Editor().showWarningMessage("Fonte de debug não encontrado. Tente recompilar o programa.");
      }
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