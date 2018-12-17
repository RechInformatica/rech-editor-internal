import { Executor, Process, File, Path } from 'rech-editor-vscode';

 /**
 * Class to find use of copys
 */
export class Autogrep {

  /** List of sources to find */
  private sources: string[] | undefined;

  public constructor(sources?: string[]){
    this.sources = sources;
  }

  /**
   * Find uses of sources
   */
  public find(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.callAutogrep().then((process: Process) => {
        let cblFiles = process.getStdout().match(/.*\.CBL /gi);
        if (cblFiles) {
          resolve(this.sortResultsAccordingSourceName(cblFiles));
        } else {
          reject();
        }
      });
    });
  }

  /**
   * Call the autogrep
   */
  private callAutogrep(): Promise<Process> {
    return new Promise((resolve) => {
      let commandline = this.buildCommandLine();
      if (commandline) {
        new Executor().runAsync(commandline, (process: Process) => {
          resolve(process);
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Build the command line to call the autogrep
   */
  private buildCommandLine(): string | undefined {
    let commandline = 'cmd.exe /C autogrep.bat ';
    let fileList: string | undefined;
    if (this.sources) {
      this.sources.forEach(source => {
        if (source.match(/.*\.(CPY|CPB)/gi)) {
          if (fileList) {
            fileList = fileList + " " + source;
          } else {
            fileList = source;
          }
        }
      });
    }
    if (fileList) {
      commandline = commandline + fileList.toUpperCase();
      return commandline;
    }
    return undefined;
  }

  /**
   * Sort the result according the source name. The similar sources names comes first
   */
  private sortResultsAccordingSourceName(cblSources: string[]): string[] {
    return cblSources;
  }

  /**
   * Add source to find
   *
   * @param source
   */
  public add(source: string) {
    let path = new Path(source);
    path = new Path(path.fullPathWin());
    let s = path.baseName() + path.extension();
    if (this.sources) {
      this.sources.concat(s);
    } else {
      this.sources = [s];
    }
  }

}