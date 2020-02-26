import { Executor, Process, Editor, RechPosition, File } from "rech-editor-cobol";
import { basename } from "path";
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
        const wc = WorkingCopy.createWcFromProcessOutput(process);
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
    const process = new Executor().runSync("cmd.exe /C F:\\BAT\\WC.bat /show");
    const wc = WorkingCopy.createWcFromProcessOutput(process);
    return wc;
  }

  /**
   * Checkout current file to Working-Copy
   * @param baseName
   */
  public static checkoutFonte(baseName: String) {
    const editor = new Editor();
    const cursors: RechPosition[] = editor.getCursors();
    editor.showInformationMessage("Executando Checkout de " + baseName + "...");
    editor.closeActiveEditor();
    new Executor().runAsync(
      "cmd.exe /c F:\\BAT\\Checkout.bat /noopen /nodic " + baseName,
      _process => {
        WorkingCopy.current().then((wc) => {
          const targetFilename = this.getTargetFileName(baseName, wc)
          const wcFile = new File(targetFilename);
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
   * Returns the target file name
   */
  private static getTargetFileName(baseName : String, wc: WorkingCopy){
    if (baseName.endsWith(".properties")){
      return wc.getEtcDir() + baseName;
    }
    if (baseName.endsWith(".DAT")){
      return wc.getDatDir() + baseName;
    }
    if (baseName.endsWith(".CBL") || baseName.endsWith(".CPY")){
      return wc.getFonDir() + baseName;
    }
    return wc.getFonDir() + baseName;
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
    const parts = WorkingCopy.getWorkingCopyString(outputProcess).split(
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
    const match = /USE_VALRET=(.*)/g.exec(output);
    if (match !== null) {
      return match[1];
    } else {
      return require("os").userInfo().username;
    }
  }

  /**
   * Returns the "mod" directory from wc
   */
  public getDatDir() {
    return "F:\\SIGER\\wc\\" + this.version + "\\" + this.name + "\\mod\\";
  }
  /**
   * Returns the "mod" directory from wc
   */
  public getModDir() {
    return "F:\\SIGER\\wc\\" + this.version + "\\" + this.name + "\\mod\\";
  }

  /**
   * Returns the "etc" directory from wc
   */
  public getEtcDir() {
    return "F:\\SIGER\\wc\\" + this.version + "\\" + this.name + "\\etc\\";
  }

  /**
   * Returns the "fon" directory from wc
   */
  public getFonDir() {
    return "F:\\SIGER\\wc\\" + this.version + "\\" + this.name + "\\fon\\";
  }
}
