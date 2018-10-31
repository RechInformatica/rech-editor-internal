import { Editor, File } from "rech-editor-vscode";

/**
 * Class for opening wf/pf files
 */
export class OpenWFPF {

    /**
     * 
     */
    public editor: Editor;
    constructor () {
        this.editor = new Editor();
    }

    /**
     * 
     */
    public open() {
        let filename = this.editor.getCurrentFileName();
        let result = /(.*)(WF|PF).CPY/gi.exec(filename);
        if (result) {
            this.editor.openFile(result[1] + ".CBL");
        } else {
            result = /(.*).CBL/gi.exec(filename);
            if (result) {
                this.editor.openFile(result[1] + "WF.CPY");
                this.editor.openFile(result[1] + "PF.CPY");
            }
        }
    }
}