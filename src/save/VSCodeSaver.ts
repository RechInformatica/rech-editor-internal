import { Executor, Editor } from 'rech-editor-vscode';

/**
 * Class for saving files through Visual Studio Code
 */
export class VSCodeSaver {

    /**
     * Method executed before saving a file
     */
    public  onBeforeSave() {
        this.executeCommand("before");
    }

    /**
     * Method executed after saving a file
     */
    public  onAfterSave() {
        this.executeCommand("after");
    }

    /**
     * Executes the command according to the trigger
     * 
     * @param trigger Word indicating the trigger
     */
    private executeCommand(trigger: string) {
        var cmd = `cmd.exe /C F:\\BAT\\Ruby.bat VSCodeSave.rb /trigger:${trigger} /source:${new Editor().getCurrentFileName()}`;
        new Executor().runAsync(cmd);
    }

}
