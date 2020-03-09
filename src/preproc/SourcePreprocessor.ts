'use babel';
import { Editor, Path } from 'rech-editor-cobol';
import { Preproc } from './preproc';

/**
 * Class to preprocess the current file open in editor showing user some different
 * options.
 */
export class SourcePreprocessor {

  /**
   * Runs preproc based on the option previously selected from the user in VSCode UI
   * @param option selected option
   *               [0] - Pré-processamento sem opções extras
   *               [1] - Mostrando hierarquia dos copys (-hc)
   *               [2] - Mostrando o uso de copys pelo programa (-lc)
   *               [3] - Mostrando os parágrafos (-lsp)
   *               [4] - Mostrando os parágrafos do programa (-lpp)
   *               [5] - Mostrando warnings normais e estendidos (-war -wes)
   *               [6] - Mostrando variáveis não usadas no programa (-vnp)
   *               [7] - Mostrando variáveis não usadas no programa e nos copys (-vnu)
   *               [8] - Mostrando warning de truncamento em MOVE (-wop=w074)
   */
  public runPreprocOnCurrentSource(selected: string | undefined) {
    const specificPreprocOptions = this.getSpecificOptions(selected);
    if (specificPreprocOptions) {
      const preprocOptions = this.buildPreprocOptions(specificPreprocOptions);
      if (selected == "3" || selected == "7") {
        const currentFile = new Editor().getCurrentFileName();
        new Preproc().setOptions(preprocOptions).setPath(currentFile).execOnTerminal(this.buildResultFileName(new Path(currentFile).fileName()));
      } else {
        this.firePreprocExecution(preprocOptions);
      }
    } else {
      new Editor().showWarningMessage("Nenhuma opção válida selecionada para pré-processamento.");
    }
  }

  /**
   * Fire preproc execution with the specified options/parameters
   *
   * @param options command-line options
   */
  private firePreprocExecution(options: string[]) {
    const currentFile = new Editor().getCurrentFileName();
    const fileName = new Path(currentFile).fileName();
    new Editor().showInformationMessage("Pré-processando fonte " + fileName + "...");
    const resultFile = this.buildResultFileName(fileName);
    new Preproc().setOptions(options).setPath(currentFile).execOnOutputChannel(resultFile).then(() => {
      new Editor().showInformationMessage("Pré-processamento finalizado com sucesso.");
      new Editor().openFileInsensitive(resultFile);
    }).catch((errorlevel) => {
      new Editor().showWarningMessage("Unexpected error thrown while source preprocess. Errorlevel: " + errorlevel);
    });
  }

  /**
   * Builds the result filename from the target source file
   *
   * @param sourceFile target source file which will be preprocessed
   */
  private buildResultFileName(sourceFile: string) {
    let resultFile = "C:\\TMP\\PREPROC\\" + require("os").userInfo().username.toLowerCase() + "\\" + sourceFile;
    resultFile = resultFile.replace(".CBL", ".LSR");
    return resultFile;
  }

  /**
   * Build preproc command line based on the option previously selected in the UI by the user
   *
   * @param specificPreprocOptions specific preproc parameters for the previously selected option
   */
  private buildPreprocOptions(specificPreprocOptions: string[]): string[] {
    if (specificPreprocOptions.length == 0) {
      return specificPreprocOptions;
    }
    let preprocOptions = ["-cpn", "-msi"];
    preprocOptions = preprocOptions.concat(specificPreprocOptions);
    preprocOptions = preprocOptions.concat("-as=");
    return preprocOptions;
  }

  /**
   * Returns the specific preproc options/parameters based on the UI selection
   *
   * @param selected UI selection
   */
  private getSpecificOptions(selected: string | undefined): string[] | undefined {
    switch (selected) {
      case "0": {
        return [];
      }
      case "1": {
        return ["-hc"];
      }
      case "2": {
        return ["-lc"];
      }
      case "3": {
        return ["-lsp"];
      }
      case "4": {
        return ["-lpp"];
      }
      case "5": {
        return ["-war", "-wes"];
      }
      case "6": {
        return ["-vnp"];
      }
      case "7": {
        return ["-vnu"];
      }
      case "8": {
        return ["-msi", "-war", "-wes", "-wop=w074"];
      }
      default: {
        return undefined;
      }
    }
  }

}