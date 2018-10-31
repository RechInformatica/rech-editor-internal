import { Editor, File } from "rech-editor-vscode";

/**
 * Class for opening wf/pf files
 */
export class OpenWFPF {

    /** Editor object */
    public editor: Editor;

    /**
     * Constructor of OpenWFPF
     */
    constructor () {
        this.editor = new Editor();
    }

    /**
     * Opens the WFPF files from the CBL file or opens the CBL file from the WF or PF file
     */
    public open() {
        /** RegEx to find WFPF files */
        const regexWFPF = /(.*)(WF|PF).CPY/gi;
        /** RegEx to find .CBL files */
        const regexCBL = /(.*).CBL/gi;
        
        let filename = this.editor.getCurrentFileName();
        let result = regexWFPF.exec(filename);
        if (result) {
            this.editor.openFile(result[1] + ".CBL");
        } else {
            result = regexCBL.exec(filename);
            if (result) {
                this.editor.openFile(result[1] + "WF.CPY");
                this.editor.openFile(result[1] + "PF.CPY");
            }
        }
    }
}