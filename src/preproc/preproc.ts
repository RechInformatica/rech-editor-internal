'use babel';
import { Executor, Path, Process, GenericExecutor } from 'rech-editor-vscode';
import { Autogrep } from '../autogrep/autogrep';

export class Preproc implements GenericExecutor {

  /** Options of préprocessor */
  private options: string[];
  /** Path of file */
  private path: string;

  /** Constructor of preprocessor */
  constructor() {
    this.options = [];
    this.path = "";
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

  public setOptions(options: string[]) {
    this.options = options;
    return this;
  }

  /**
   * Exec the preprocess
   */
  public exec(file: string) {
    return new Promise((resolve, reject) => {
      if (file.match(/.*\.(CPY|CPB)/)) {
        new Autogrep([new Path(this.path).fileName()]).find().then((cblFiles) => {
          let cblFile = cblFiles[0];
          this.setPath(new Path(this.path).directory() + cblFile);
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
   * Run the preproc
   * 
   * @param file 
   */
  private execPreproc(file: string) {
    return new Promise((resolve) => {
      let comandline = this.buildCommandLine(file);
      new Executor().runAsync(comandline, (process: Process) => {
        resolve(process);
      });
    });
  }

  /**
   * Builds the final command line for preproc execution
   * 
   * @param file result filename
   */
  private buildCommandLine(file: string): string {
    let finalCmd = "preproc.bat ";
    finalCmd = finalCmd + this.path + " ";
    finalCmd = finalCmd + this.injectFileWithinAsParameter(file).join(" ");
    finalCmd = finalCmd.replace(/,/g, " ");
    finalCmd = finalCmd + " -is"; // Only isCobol sources
    finalCmd = finalCmd.replace(/\//g, "\\");
    return finalCmd;
  }

  /**
   * Injects the filename within the 'as' command line parameter
   * 
   * @param file result filename
   */
  private injectFileWithinAsParameter(file: string): string[] {
    let optionsWithFile = this.cloneOptions();
    // Updates the 'as' parameter adding the result filename.
    // This parameter is always the last one
    let asParameter = optionsWithFile[this.options.length - 1];
    asParameter = asParameter + file;
    optionsWithFile[this.options.length - 1] = asParameter;
    //
    return optionsWithFile;
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