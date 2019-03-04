import { Editor, File, Scan, Path} from "rech-editor-cobol";
import { WorkingCopy } from "../wc/WorkingCopy";

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
    public async open() {
        /** RegEx to find WFPF files */
        const regexWFPF = /(.*)(WF|PF).CPY/gi;
        /** RegEx to find .CBL files */
        const regexCBL = /(.*).CBL/gi;
        /** RegEx to find the constant from the function where the cursor is positioned */
        const regexFunction = /\s([A-Z]+\-FUN\-[A-Z]+)/gi;
        /** Get the current file name */
        let filename = this.editor.getCurrentFileName();
        /** If the current file is a WF | PF file */
        let result = regexWFPF.exec(filename);
        if (result) {
            /** Name of the Cobol extension file */
            let cobolFile = result[1] + ".CBL";
            cobolFile = await this.resolvePath(cobolFile);
            this.editor.openFile(cobolFile, () => {
                /** Name of the function */
                let resultFunction = regexFunction.exec(this.editor.getCurrentLine());
                /** If the cursor is over the name of a function */
                if (resultFunction) {
                    new File(cobolFile).loadBuffer().then((buffer) => {
                        /** Search for the name of the function in the Cobol File and then position it on the respective line */
                        new Scan(buffer).scan(new RegExp((<string[]>resultFunction)[1], 'gi'), (iterator: any) => {
                            new Editor().openFileInsensitive(cobolFile, () => {
                                new Editor().setCursor(iterator.row, iterator.column);
                            });
                            iterator.stop();
                        });
                    });
                }
            });
        /** If the current file is a Cobol file */
        } else {
            result = regexCBL.exec(filename);
            if (result) {
                let wfFileName = await this.resolvePath(result[1] + "WF.CPY");
                let pfFileName = await this.resolvePath(result[1] + "PF.CPY");
                this.editor.openFile(wfFileName);
                this.editor.openFile(pfFileName);
            }
        }
    }

    /**
     * Resolve the fileName path
     *
     * @param fileName
     */
    private async resolvePath(fileName: string): Promise<string> {
        let wc = await WorkingCopy.current();
        let path = new Path(fileName);
        let result = wc.getSourcesDir() + path.fileName();
        if (!new File(result).exists()) {
            result = "F:\\Fontes\\" + path.fileName();
        }
        return result;
    }
}