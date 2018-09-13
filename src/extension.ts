'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Editor      from 'rech-editor-vscode';
import WorkingCopy from './wc/WorkingCopy';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.openFontesTrunk', () => {
        showOpenDialog('F:\\FONTES\\');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.openScripts', () => {
        showOpenDialog('F:\\BAT\\');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.openWc', () => {
        showOpenDialog(WorkingCopy.current().getSourcesDir());
    }));

}

/**
 * Opens dialog for file selection and automatically opens the files in editor
 * 
 * @param defaultDir default directory
 */
function showOpenDialog(defaultDir: string) {
    var editor = new Editor();
    editor.showOpenDialog(
        defaultDir,
       (currentFile) => { editor.openFile(currentFile) },
   );
}

// this method is called when your extension is deactivated
export function deactivate() {
}