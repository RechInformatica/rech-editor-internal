'use babel';
import { Executor, Path, Process, GenericExecutor, File, Log } from 'rech-editor-cobol';
import { Autogrep } from '../autogrep/autogrep';
import { WorkingCopy } from '../wc/WorkingCopy';
import { PreprocStatusBar } from './PreprocStatusBar';

/**
 * Cobol source preprocessor
 */
export class Preproc implements GenericExecutor {

  /** Preprocessor options */
  private options: string[];
  /** File path */
  private path: string;
  /** WorkingCopy */
  private wc: WorkingCopy;
  /** Versão */
  private versao: string;
  /** Extra copy Directory */
  private extraCopyDirectories: string[];

  /** Constructor of preprocessor */
  constructor(versao?: string, wc?: WorkingCopy) {
    this.options = [];
    this.path = "";
    if (wc) {
      this.wc = wc;
    } else {
      this.wc = WorkingCopy.currentSync();
    }
    if (versao) {
      this.versao = versao;
    } else {
      this.versao = "DES";
    }
    this.extraCopyDirectories = [];
  }

  /**
   * Define the path to preprocess
   */
  public setPath(path: string | Path): Preproc {
    if (path instanceof Path) {
      this.path = path.fullPathWin();
    } else {
      this.path = new Path(path).fullPathWin();
    }
    return this;
  }

  /**
   * Set extra params
   */
  setExtraParams(params: string[]): Preproc {
    this.extraCopyDirectories = params;
    return this;
  }

  /**
   * Defines preprocessor options
   *
   * @param options
   */
  public setOptions(options: string[]) {
    this.options = options;
    return this;
  }

  /**
   * Run preprocessor
   */
  public exec(file?: string) {
    return new Promise((resolve, reject) => {
      PreprocStatusBar.show(`File: ${this.path} - Options ${this.options}`);
      this.execPreprocessorFromSource(file).then((result) => {
        PreprocStatusBar.hide();
        resolve(result);
      }).catch(() => {
        PreprocStatusBar.hide();
        reject();
      });
    });
  }

/**
   * Run preprocessor from source
   */
  public execPreprocessorFromSource(file?: string) {
    Log.get().info("Preproc - Exec() was caled. File: " + file);
    return new Promise((resolve, reject) => {
      if (file) {
        const directory = new File(new Path(file).directory());
        if (!directory.exists()) {
          directory.mkdir();
        }
      }
      Log.get().info("Preproc - Exec() was caled. File to process in promise: " + file);
      if (file && file.match(/.*\.(CPY|CPB)/gi)) {
        new Autogrep([new Path(this.path).fileName()]).find().then((cblFiles) => {
          const cblFile = cblFiles[0];
          this.setPath(this.builCblfullPath(cblFile));
          if (cblFile) {
            this.execPreproc(file).then((process) => {
              resolve(process);
            }).catch(() => {
              Log.get().error("Preproc - rejected! Error in execPreproc() if is a COPY file");
              reject();
            });
          } else {
            Log.get().error("Preproc - rejected! cblFile was undefined");
            reject();
          }
        }).catch(() => {
          Log.get().error("Preproc - rejected! Error in Autogrep.find()");
          reject();
        });
      } else {
        this.execPreproc(file).then((process) => {
          Log.get().info("Preproc - Ok. File: " + file);
          resolve(process);
        }).catch(() => {
          Log.get().error("Preproc - rejected! Error in execPreproc()");
          reject();
        });
      }
    });
  }

  /**
   * Build the cblFile full path
   *
   * @param cblFile
   */
  private builCblfullPath(cblFile: string): string {
    const file = new File(new Path(this.path).directory() + cblFile);
    if (file.exists()) {
      return file.fileName;
    } else {
      return "F:\\FONTES\\" + cblFile;
    }
  }

  /**
   * Run the preproc
   *
   * @param file
   */
  private execPreproc(file?: string) {
    return new Promise((resolve, reject) => {
      try {
        const commandLine = this.buildCommandLine(file);
        Log.get().info("Preproc - execPreproc() commandLine: " + commandLine);
        new Executor().runAsync(commandLine, (process: Process) => {
          resolve(process.getStdout());
        }, "win1252");
      } catch {
        reject();
      }
    });
  }

  /**
   * Run preprocessor redirecting the output to the output channel
   */
  public execOnOutputChannel(file: string) {
    return new Promise((resolve, reject) => {
      const commandLine = this.buildCommandLine(file);
      Log.get().info("Preproc - execOnOutputChannel() commandLine: " + commandLine);
      new Executor().runAsyncOutputChannel("preproc", commandLine, (errorlevel: number) => {
        if (errorlevel === 0) {
          resolve(errorlevel);
        } else {
          reject(errorlevel);
        }
      });
    });
  }

  /**
   * Run preprocessor redirecting the output to the output channel
   */
  public execOnTerminal(file: string) {
    const commandLine = this.buildCommandLine(file);
    Log.get().info("Preproc - execOnOutputChannel() commandLine: " + commandLine);
    new Executor().runAsyncTerminal("preproc", commandLine);
  }

  /**
   * Builds the final command line for preproc execution
   *
   * @param file result filename
   */
  private buildCommandLine(file?: string): string {
    let finalCmd = "preproc.bat ";
    finalCmd = finalCmd + this.path + " ";
    finalCmd = finalCmd + this.injectFileWithinAsParameter(file).join(" ");
    finalCmd = finalCmd.replace(/,/g, " ");
    finalCmd = finalCmd + " " + this.injectDirectoriesWithinAsParameter();
    finalCmd = finalCmd.replace(/\//g, "\\");
    Log.get().info("Preproc - commandLine to call: " + finalCmd);
    return finalCmd;
  }

  /**
   * Injects the filename within the 'as' command line parameter
   *
   * @param file result filename
   */
  private injectFileWithinAsParameter(file?: string): string[] {
    const optionsWithFile = this.cloneOptions();
    // If file is defined, updates the 'as' parameter adding the result filename.
    if (file) {
      const AsParameterPosition = optionsWithFile.indexOf("-as=");
      if (AsParameterPosition < 0) {
        return optionsWithFile;
      }
      let asParameter = optionsWithFile[AsParameterPosition];
      asParameter = asParameter + file;
      optionsWithFile[AsParameterPosition] = asParameter;
    }
    //
    return optionsWithFile;
  }

  private injectDirectoriesWithinAsParameter() {
    const myWc = this.wc;
    let dc = " -dc=";
    this.extraCopyDirectories.forEach((extraDir) => {
      dc += ";" + extraDir;
    })
    if (this.extraCopyDirectories.length != 0) {
      dc += ".\\;"
    }
    dc += new Path(this.path).directory() + ";" + myWc.getFonDir() + ";" + "F:\\FONTES"
    return dc;
  }

  /**
   * Clones the original options
   */
  private cloneOptions(): string[] {
    const cloned: string[] = [];
    this.options.forEach((x) => {
      cloned.push(x);
    });
    return cloned;
  }

}