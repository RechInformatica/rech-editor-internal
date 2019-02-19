import { Editor, Path } from "rech-editor-cobol";
import {window, commands} from 'vscode';

/**
 * Class to controll read-only files
 */
export class ReadOnlyControll {

    /**
     * Check if is a read only file and blocks editing
     */
    public static check() {
        if (new Editor().isReadOnly() && this.isCobolFileExtension()) {
            window.showInformationMessage("Cannot edit in read-only file", "Make checkout", "Make writable").then((chose) => {
                commands.executeCommand("undo");
                switch(chose) {
                    case "Make checkout": this.makeCheckout(); break;
                    case "Make writable": this.makeWritable(); break;
                }
            });
        }
    }

    /**
     * Make checkout of file
     */
    private static makeCheckout() {
        commands.executeCommand("rech.editor.internal.checkout");
    }

    /**
     * Make file writable
     */
    private static makeWritable() {
        commands.getCommands().then((commands) => {
            if (commands.indexOf("readOnly.makeWriteable") < 0) {
                window.showWarningMessage("Please, install 'Read-Only Indicator' from 'Alessandro Fragnani' extension");
                return;
            }
        });
        commands.executeCommand("readOnly.makeWriteable");
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