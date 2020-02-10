// import { Executor } from "../commons/executor";
import { Editor, Executor, Path } from "rech-editor-cobol";
import { commands } from "vscode";

/**
 * Class to compile Cobol programs
 */
export class Compiler {
    /**
     * Compiles the file currently open on editor
     */
    async compileCurrentFile() {
        const editor = new Editor();
        editor.saveActiveEditor();
        const path = new Path(editor.getCurrentFileName());
        const baseName = path.baseName();
        const extension = path.extension();
        const directory = path.directory();
        editor.showInformationMessage(`Compilando ${path.fileName()}...`);
        await commands.executeCommand('workbench.output.action.clearOutput');
        const commandLine = "cmd.exe /c F:\\BAT\\VSCodeComp.bat " + baseName + " " + extension + " " + directory;
        new Executor().runAsyncOutputChannel("co", commandLine, (errorLevel: number) => {
            if (errorLevel == 0) {
                editor.showInformationMessage(`Compilação finalizada para ${path.fileName()}.`);
            } else {
                editor.showWarningMessage(`Compilação para ${path.fileName()} finalizada com erro.`);
            }
        });
        return;
    }

}
