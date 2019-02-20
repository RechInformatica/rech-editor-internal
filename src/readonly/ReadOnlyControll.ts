import { Editor, Path } from "rech-editor-cobol";
import {window, commands} from 'vscode';

/**
 * Class to controll read-only files
 */
export class ReadOnlyControll {

    /**
     * Check if is a read only file and blocks editing
     *
     * @param uri
     */
    public static check(uri: string) {
        let editor = new Editor();
        if (editor.getCurrentFileName() === uri && editor.isReadOnly() && this.isCobolFileExtension()) {
            window.showInformationMessage("Cannot edit in read-only file", "Make checkout", "Make writable").then(async (chose) => {
                await commands.executeCommand("undo");
                switch(chose) {
                    case "Make checkout": this.makeCheckout(uri); break;
                    case "Make writable": this.makeWritable(); break;
                }
            });
        }
    }

    /**
     * Make checkout of file
     *
      * @param uri
      */
    private static async makeCheckout(uri: string) {
        await commands.executeCommand("rech.editor.internal.checkout", uri);
    }

    /**
     * Make file writable
     */
    private static async makeWritable() {
        commands.getCommands().then((commands) => {
            if (commands.indexOf("readOnly.makeWriteable") < 0) {
                window.showWarningMessage("Please, install 'Read-Only Indicator' from 'Alessandro Fragnani' extension");
                return;
            }
        });
        await commands.executeCommand("readOnly.makeWriteable");
    }

    /**
     * Returns true if a Cobol file extension
     */
    private static isCobolFileExtension(): boolean {
        if (window.activeTextEditor) {
            let extension = new Path(window.activeTextEditor.document.fileName).extension().toLowerCase();
            let cobolFileExtensions = [".cbl", ".dat", ".cpb", ".cpy", ".tpl"];
            if ( cobolFileExtensions.indexOf(extension) >= 0) {
                return true;
            }
        }
        return false;
    }

}