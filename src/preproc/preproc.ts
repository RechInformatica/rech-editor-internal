'use babel';
import { Executor, Path, Process, GenericExecutor } from 'rech-editor-vscode';

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
      this.path = path.fullPath();
    } else {
      this.path = path;
    }
    return this;
  }

  public setOptions(options: string[]) {
    this.options = options;
    return this;
  }

  /**
   * Run preprocess
   */
  public exec(file: string) {
    return new Promise((resolve) => {
      let comandline = (this.getCmdArgs(file)).toString().replace(/,/g, " ") + " " + this.path.replace("file:///f%3A", "F:").replace(/\//g, "\\");
      new Executor().runAsync(comandline, (process: Process) => {
        resolve(process);
      });
    });
  }

  /**
   * Return the comand line args
   */
  private getCmdArgs(file: string): string[] {
    const optionsWithFile = Object.assign({}, this.options);
    optionsWithFile[optionsWithFile.length - 1] = optionsWithFile[optionsWithFile.length - 1] + file;
    return ['preproc.bat'].concat(optionsWithFile);
  }

}