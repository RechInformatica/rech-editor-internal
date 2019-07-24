import { Executor, Editor, File } from "rech-editor-cobol";

/**
 * Class for run a external process to make a Intelligent replace from the buffer
 */
export class IntelligentReplace {

    // Run the code processor
    public static run(processorCommandLine: string, fileName: string) {
        const editor = new Editor();
        editor.showInformationMessage("Disparando processador de código")
        const buffer = editor.getSelectionBuffer();
        buffer.join("\n");
        const file = new File(fileName);
        file.saveBufferSync(buffer, "latin1");
        new Executor().runSync(`${processorCommandLine}`);
        editor.showInformationMessage("Processamento de código finalizado")
        editor.replaceSelection(file.loadBufferSync("latin1"));
    }

}
