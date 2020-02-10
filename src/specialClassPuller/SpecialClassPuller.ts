'use babel';
import { GenericExecutor, Path, File } from 'rech-editor-cobol';

const IMPORT_FILE = "import.properties";

/**
 * Class to return the special class puller from Siger
 */
export class SpecialClassPuller implements GenericExecutor {

    private path: string = "";

    setPath(path: string | Path): GenericExecutor {
        if (path instanceof Path) {
            this.path = path.fullPathWin();
          } else {
            this.path = new Path(path).fullPathWin();
          }
          return this;
    }

    public setExtraParams(_params: string[]): GenericExecutor {
        throw new Error("SpecialClassPuller.setExtraParams not Implemented");
    }

    exec(_file?: string | undefined): Promise<any> {
        return new Promise<string>((resolve, reject) => {
            const file = new File(this.getEtcPath());
            file.loadBuffer().then((buffer) => {
                resolve(buffer);
            }).catch(() => {
                reject();
            })
        });
    }

    /**
     * Returns the etc path from the source version
     */
    private getEtcPath(): string {
        if (this.path.match(/f\:[\\\/]fontes/i)) {
            return "F:\\Siger\\des\\etc\\" + IMPORT_FILE
        }
        const match = this.path.match(/[\\\/]wc[\\\/]([\w\.]+)[\\\/]/i);
        if (match) {
            return "F:\\Siger\\" + match[1] + "\\etc\\" + IMPORT_FILE
        }
        return this.path.replace(/fon.*/, "etc\\") + IMPORT_FILE;
    }

}