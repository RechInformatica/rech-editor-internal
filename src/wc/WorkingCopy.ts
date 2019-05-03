import { Executor, Process, Editor, RechPosition, File } from "rech-editor-cobol";
/**
 * Class for returning Working-Copy general information
 */
export class WorkingCopy {
  /** Name of the working-copy */
  name: string;
  /** Version of the working-copy */
  version: string;

  /**
   * Creates an instance of Working-Copy class with the specified WC name
   *
   * @param wc Working-Copy name
   */
  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
  }

  /**
   * Returns an instance of the current WorkingCopy
   */
  public static current() {
    return new Promise<WorkingCopy>((resolve, reject) => {
      new Executor().runAsync("cmd.exe /C F:\\BAT\\WC.bat /show", process => {
        var wc = WorkingCopy.createWcFromProcessOutput(process);
        if (wc !== undefined) {
          resolve(wc);
        } else {
          reject();
        }
      });
    });
  }

  /**
   * Returns an instance of the current WorkingCopy
   */
  public static currentSync() {
    let process = new Executor().runSync("cmd.exe /C F:\\BAT\\WC.bat /show");
    var wc = WorkingCopy.createWcFromProcessOutput(process);
    return wc;
  }

  /**
   * Checkout current file to Working-Copy
   * @param baseName
   */
  public static checkoutFonte(baseName: String) {
    let editor = new Editor();
    let cursors: RechPosition[] = editor.getCursors();
    editor.showInformationMessage("Executando Checkout de " + baseName + "...");
    editor.closeActiveEditor();
    new Executor().runAsync(
      "cmd.exe /c F:\\BAT\\Checkout.bat /noopen /nodic " + baseName,
      _process => {
        WorkingCopy.current().then((wc) => {
          let targetFilename = wc.getSourcesDir() + baseName;
          let wcFile = new File(targetFilename);
          if (wcFile.exists()) {
            new Editor().openFileInsensitive(targetFilename, () => {
              new Editor().setCursors(cursors);
            });
          }
        }).catch(() => {
          new Editor().showWarningMessage("Unexpected problem detecting working-copy which prevents making checkout");
        });
      }
    );
  }

  /**
   * Creates a WorkingCopy instance from the 'wc' execution output
   *
   * @param process process information
   */
  private static createWcFromProcessOutput(process: Process | string) {
    var outputProcess;
    if (process instanceof Process) {
      outputProcess = process.getStdout();
    } else {
      outputProcess = process;
    }
    var parts = WorkingCopy.getWorkingCopyString(outputProcess).split(
      " "
    );
    var currentName = "";
    var currentVersion = "des";
    if (parts) {
      if (parts.length > 0) {
        currentName = parts[0];
      }
      if (parts.length > 1) {
        currentVersion = parts[1];
      }
    }
    return new WorkingCopy(currentName, currentVersion);
  }

  /**
   * Returns a String representation of the current user's Working Copy
   */
  private static getWorkingCopyString(output: string) {
    var match = /USE_VALRET=(.*)/g.exec(output);
    if (match !== null) {
      return match[1];
    } else {
      return require("os").userInfo().username;
    }
  }

  /**
   * Returns the directory where Cobol files are located
   */
  public getSourcesDir() {
    return "F:\\SIGER\\wc\\" + this.version + "\\" + this.name + "\\fon\\";
  }
}
