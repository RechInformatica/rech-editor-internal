import { Editor, Executor, BufferSplitter } from 'rech-editor-cobol';
import * as fs from 'fs';

/**
 * Class to execute batGrep from within VSCode
 */
export class BatGrep {
     /**
     * Executes batGrep opening the result file on the editor
     */
    public batGrep(word: string) {
        new Editor().showInputBox("Argumento a ser pesquisado pelo batGrep", "batGrep", (info) => {
            this.runBatGrep(info);
        }, word);
    }
     /**
     * Executes the batGrep command itself and handles the result file
     */
    runBatGrep(info: string | undefined) {
        if (info !== undefined && info.length > 0) {
            new Editor().showInformationMessage(`Iniciando busca por '${info}' em F:\\BAT ...`);
            new Executor().runAsync(`cmd.exe /C F:\\BAT\\batGrep.bat EDITOR ${info}`, (process) => {
                const resultFile = process.getStdout().trim();
                if (fs.existsSync(resultFile)) {
                    new Editor().showInformationMessage("BatGrep executado com sucesso.");
                    new Editor().openFileInsensitive(resultFile);
                } else {
                    new Editor().showWarningMessage("Nenhum resultado encontrado para " + info + "'.");
                }
            });
        } else {
            new Editor().showWarningMessage("Nenhum argumento informado para o batGrep!");
        }
    }

}