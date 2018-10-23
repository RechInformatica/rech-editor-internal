'use babel';
import { Executor, Path, Process, GenericExecuter } from 'rech-editor-vscode';

export class Preproc implements GenericExecuter {

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
   * Create a new instance of preproc to update local base
   */
  static localDatabaseUpdate() {
    let newPreproc = new Preproc();
    newPreproc.buildCommandLine(["-bd", "-bdl", "-is", "-msi"]);
    return newPreproc;
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

  /**
   * Build command line
   */
  public buildCommandLine(options: any): Preproc {
    this.options = this.options.concat(options);
    return this;
  }

  /**
   * Run preprocess
   */
  public exec() {
    return new Promise((resolve) => {
      let comandline = (this.getCmdArgs()).toString().replace(/,/g, " ");
      new Executor().runAsync(comandline, (process: Process) => {
        resolve(process);
      });
    });
  }
  
  /**
   * Return the comand line args
   */
  private getCmdArgs(): string[] {
    return ['preproc.bat'].concat(this.options).concat([this.path]);
  }

}