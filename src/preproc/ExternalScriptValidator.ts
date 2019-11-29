'use babel';
import { Executor, Path, Process, GenericExecutor, File, Log } from 'rech-editor-cobol';

/**
 * Class to run COBOL validations running external scripts
 */
export class ExternalScriptValidator implements GenericExecutor {

  /** File path */
  private path: string;
  /** Extra copy directory */
  private extraCopyDirectory: string;

  constructor() {
    this.path = "";
    this.extraCopyDirectory = "";
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
   * Set the extra params to exec the VSCodeDiagnostic
   *
   * @param params
   */
  public setExtraParams(params: string[]): ExternalScriptValidator {
    this.extraCopyDirectory = params[0];
    return this;
  }

  /**
   * Run validations
   */
  public exec(_file?: string) {
    return new Promise<any>((resolve) => {
      const extraArgs = this.extraCopyDirectory != "" ? "/extraCopyDirectory:" + this.extraCopyDirectory : "";
      new Executor().runAsync("cmd.exe /c F:\\BAT\\Ruby.bat VSCodeDiagnostic.rb /source:" + this.path + extraArgs, (process: Process) => {
        resolve(process.getStdout());
      }, "win1252");
    });
  }
}