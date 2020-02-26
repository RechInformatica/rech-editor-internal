import { Editor, File, Scan, Path } from "rech-editor-cobol";
import { WorkingCopy } from "../wc/WorkingCopy";

/**
 * Class for opening suffixed files related to a Cobol program
 */
export class OpenSuffixedFiles {

    /** Editor object */
    public editor: Editor;

    constructor() {
        this.editor = new Editor();
    }

    /**
     * Opens the suffixed files from the CBL file or opens the CBL file from the equivalent copybooks
     */
    public open(suffixes: string[]): void {
        WorkingCopy.current().then((wc) => {
            const filename = this.editor.getCurrentFileName();
            const path = new Path(filename);
            if (this.isCurrentFileCbl(filename)) {
                suffixes.forEach((currentSuffix) => {
                    this.openFileIfExists(path.baseName() + currentSuffix, wc);
                });
            } else {
                if (this.isCurrentFileOfAnySuffix(filename, suffixes)) {
                    const cblFileName = path.baseName().slice(0, -2) + ".CBL";
                    this.openFileIfExists(cblFileName, wc);
                }
            }
        }).catch();
    }

    /**
     * Returns true if the current file is CBL
     *
     * @param filename
     */
    private isCurrentFileCbl(filename: string): boolean {
        return filename.toUpperCase().endsWith(".CBL");
    }

    /**
     * Returns true if the specified filename has any of the suffixes
     *
     * @param filename filename
     * @param suffixes suffixes
     */
    private isCurrentFileOfAnySuffix(filename: string, suffixes: string[]) {
        return suffixes.some((currentSuffix) => {
            return filename.endsWith(currentSuffix);
        });
    }

    /**
     * Opens the specified file if exists
     *
     * @param filename filename
     */
    private openFileIfExists(filename: string, wc: WorkingCopy): void {
        const resolvedPath = this.resolvePath(filename, wc);
        if (new File(resolvedPath).exists()) {
            this.editor.openFile(resolvedPath);
        }
    }

    /**
     * Resolve the fileName path
     *
     * @param fileName
     */
    private resolvePath(fileName: string, wc: WorkingCopy): string {
        const path = new Path(fileName);
        let result = wc.getFonDir() + path.fileName();
        if (!new File(result).exists()) {
            result = "F:\\Fontes\\" + path.fileName();
        }
        return result;
    }
}