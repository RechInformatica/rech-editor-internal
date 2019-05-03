import { File, Editor, Executor } from "rech-editor-cobol";

export class CobolLowercaseConverter {

  /**
   * Convert the buffer to lowercase
   *
   * @param buffer
   */
  public static convert(buffer: string[]): string {
    const fileToProcess = CobolLowercaseConverter.buildFileProcess(buffer);
    const outputFile = new File(`${fileToProcess.fileName}.conv`);
    const errorFile = new File(`${fileToProcess.fileName}.XerrX`);
    new Executor().runSync(CobolLowercaseConverter.buildCommandLine(fileToProcess, outputFile));
    if (errorFile.exists()) {
      new Editor().showWarningMessage("Error to convert the buffer to lowercase");
      return buffer.join("\n");
    }
    return outputFile.loadBufferSync("latin1");
  }

  /**
    * Returns the file to process
    */
  private static buildFileProcess(buffer: string[]) {
    let file = new File(`${Date.now().toString()}_${require("os").userInfo().username.toLowerCase()}.cbl`)
    file.saveBufferSync(buffer, "latin1");
    return file;
  }

  /**
   * Build the command line
   *
   * @param fileToProcess
   * @param outputFile
   */
  private static buildCommandLine(fileToProcess: File, outputFile: File) {
    return `call cmd /c SourceCase.bat ${fileToProcess.fileName}  /toLower /toShort > ${outputFile.fileName}`;
  }
}