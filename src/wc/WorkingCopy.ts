import { Executor, Process } from 'rech-editor-vscode';
/**
 * Class for returning Working-Copy general information
 */
export class WorkingCopy {

    /** Name of the working-copy */
    name: string;
    /** Version of the working-copy */
    version: string;

    /**
     * Creates an instance of Working-Copy class with the specified WC name
     * 
     * @param wc Working-Copy name
     */
    constructor(name: string, version: string) {
        this.name = name;
        this.version = version;
    }

    /**
     * Returns an instance of the current WorkingCopy
     */
    public static current() {
        return new Promise<WorkingCopy>((resolve) => {
            new Executor().runAsync("cmd.exe /C F:\\BAT\\WC.bat /show", (process) => {
                var wc = WorkingCopy.createWcFromProcessOutput(process);
                resolve(wc);
            });
        });
    }

    /**
     * Creates a WorkingCopye instance from the 'wc' execution output
     * 
     * @param process process information
     */
    private static createWcFromProcessOutput(process: Process) {
        var parts = WorkingCopy.getWorkingCopyString(process.getStdout()).split(" ");
        var currentName = "";
        var currentVersion = "des";
        if (parts) {
            if (parts.length > 0) {
                currentName = parts[0];
            }
            if (parts.length > 1) {
                currentVersion = parts[1];
            }
        }
        return new WorkingCopy(currentName, currentVersion);
    }

    /**
     * Returns a String representation of the current user's Working Copy
     */
    private static getWorkingCopyString(output: string) {
        var match = /USE_VALRET=(.*)/g.exec(output);
        if (match !== null) {
            return match[1];
        } else {
            return require("os").userInfo().username;
        }
    }

    /**
     * Returns the directory where Cobol files are located
     */
    public getSourcesDir() {
        return "F:\\SIGER\\wc\\" + this.version + "\\" + this.name + "\\fon\\";
    }

}
