import { StatusBarItem, window, StatusBarAlignment } from "vscode";

export class PreprocStatusBar {

    /** Preproc StatusBar controll  */
    private static preprocStatusBar: StatusBarItem | undefined;
    /** Indicates if the  preprocStatusBar is visible*/
    private static isVisible: boolean = false;

    /**
     * Build the preproc statusBar
     */
    public static buildStatusBar() {
        PreprocStatusBar.preprocStatusBar = window.createStatusBarItem(StatusBarAlignment.Left);
        PreprocStatusBar.preprocStatusBar.text = "Preproc is running...";
    }

    /**
     * Show the statusBar from preproc
     */
    public static show(file?: string) {
        if (PreprocStatusBar.isVisible) {
            return;
        }
        PreprocStatusBar.isVisible = true;
        if (PreprocStatusBar.preprocStatusBar) {
            if (file) {
                PreprocStatusBar.preprocStatusBar.tooltip = file;
            } else {
                PreprocStatusBar.preprocStatusBar.tooltip = undefined;
            }
            PreprocStatusBar.preprocStatusBar.show();
        }
    }

    /**
     * Hide the statusBar from preproc
     */
    public static hide() {
        if (!PreprocStatusBar.isVisible) {
            return;
        }
        PreprocStatusBar.isVisible = false;
        if (PreprocStatusBar.preprocStatusBar) {
            PreprocStatusBar.preprocStatusBar.hide();
        }
    }

}