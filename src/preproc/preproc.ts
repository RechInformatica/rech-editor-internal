'use babel';
import { Executor, Path, Process, GenericExecutor, File } from 'rech-editor-cobol';
import { Autogrep } from '../autogrep/autogrep';
import { WorkingCopy } from '../wc/WorkingCopy';

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
      if (file && file.match(/.*\.(CPY|CPB)/gi)) {
        new Autogrep([new Path(this.path).fileName()]).find().then((cblFiles) => {
          let cblFile = cblFiles[0];
          this.setPath(this.builCblfullPath(cblFile));
          if (cblFile) {
            this.execPreproc(file).then((process) => {
              resolve(process);
            }).catch(() => {
              reject();
            });
          } else {
            reject();
          }
        }).catch(() => {
          reject();
        });
      } else {
        this.execPreproc(file).then((process) => {
          resolve(process);
        }).catch(() => {
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
    let file = new File(new Path(this.path).directory() + cblFile);
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
    return new Promise((resolve) => {
      let commandLine = this.buildCommandLine(file);
      new Executor().runAsync(commandLine, (process: Process) => {
        resolve(process);
      }, "win1252");
    });
  }

  /**
   * Run preprocessor redirecting the output to the output channel
   */
  public execOnOutputChannel(file: string) {
    return new Promise((resolve) => {
      let commandLine = this.buildCommandLine(file);
      new Executor().runAsyncOutputChannel("preproc", commandLine, (errorlevel: number) => {
        resolve(errorlevel);
      });
    });
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
    finalCmd = finalCmd + " -is"; // Only isCobol sources
    finalCmd = finalCmd + " " + this.injectDirectoriesWithinAsParameter();
    finalCmd = finalCmd.replace(/\//g, "\\");
    return finalCmd;
  }

  /**
   * Injects the filename within the 'as' command line parameter
   *
   * @param file result filename
   */
  private injectFileWithinAsParameter(file?: string): string[] {
    let optionsWithFile = this.cloneOptions();
    // If file is defined, updates the 'as' parameter adding the result filename.
    if (file) {
      let AsParameterPosition = optionsWithFile.indexOf("-as=");
      let asParameter = optionsWithFile[AsParameterPosition];
      asParameter = asParameter + file;
      optionsWithFile[AsParameterPosition] = asParameter;
    }
    //
    return optionsWithFile;
  }

  private injectDirectoriesWithinAsParameter() {
    let myWc = this.wc;
    return " -dc=.\\;" + new Path(this.path).directory() + ";" + myWc.getSourcesDir() + ";" + "F:\\FONTES";
  }

  /**
   * Clones the original options
   */
  private cloneOptions(): string[] {
    let cloned: string[] = [];
    this.options.forEach((x) => {
      cloned.push(x);
    });
    return cloned;
  }

}