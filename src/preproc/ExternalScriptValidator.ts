'use babel';
import { Executor, Path, Process, GenericExecutor, File, Log } from 'rech-editor-cobol';

/**
 * Class to run COBOL validations running external scripts
 */
export class ExternalScriptValidator implements GenericExecutor {

  /** File path */
  private path: string;

  constructor() {
    this.path = "";
  }

  /**
   * Define the path to validate
   */
  public setPath(path: string | Path): ExternalScriptValidator {
    if (path instanceof Path) {
      this.path = path.fullPathWin();
    } else {
      this.path = new Path(path).fullPathWin();
    }
    return this;
  }

  /**
   * Run validations
   */
  public exec(_file?: string) {
    return new Promise<any>((resolve) => {
      new Executor().runAsync("cmd.exe /c F:\\BAT\\Ruby.bat VSCodeDiagnostic.rb /source:" + this.path, (process: Process) => {
        resolve(process.getStdout());
      }, "win1252");
    });
  }
}