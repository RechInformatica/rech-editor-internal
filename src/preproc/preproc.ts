'use babel';
import { Executor, Path, Process, GenericExecutor } from 'rech-editor-vscode';

/**
 * Cobol source preprocessor
 */
export class Preproc implements GenericExecutor {

  /** Preprocessor options */
  private options: string[];
  /** File path */
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
  public exec(file: string) {
    return new Promise((resolve) => {
      let commandLine = this.buildCommandLine(file);
      new Executor().runAsync(commandLine, (process: Process) => {
        resolve(process);
      });
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
  private buildCommandLine(file: string): string {
    let finalCmd = "preproc.bat ";
    finalCmd = finalCmd + this.path.replace("file:///f%3A", "F:") + " ";
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