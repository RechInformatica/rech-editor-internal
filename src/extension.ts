'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Editor, Executor } from 'rech-editor-vscode';
import { WorkingCopy } from './wc/WorkingCopy';
import { VSCodeSaver } from './save/VSCodeSaver';
import { FonGrep } from './fongrep/fongrep';
import { FileOpener } from './open/FileOpener';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(_context: any) {
    let context = <vscode.ExtensionContext>_context;
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.openFontesTrunk', () => {
        showOpenDialog('F:\\FONTES\\');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.openScripts', () => {
        showOpenDialog('F:\\BAT\\');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.openWc', () => {
        showOpenDialog(WorkingCopy.current().getSourcesDir());
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.fonGrep', () => {
        var editor = new Editor();
        var fongrep = new FonGrep();
        var text = editor.getSelectionBuffer()[0];
        if (text === ''){
            text = editor.getCurrentWord();
        }
        fongrep.fonGrep(text);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.RechWindowDesigner', () => {
        let FileName = new Editor().getCurrentFileName();
        let editor = new Editor();
        editor.showInformationMessage("Executando Rech Window Designer de " + FileName + "...");
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\RWD.bat  " + FileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.openThis', () => {
        var fileOpener = new FileOpener();
        fileOpener.addPathForFileSearching("F:\\FONTES\\");
        fileOpener.addPathForFileSearching("F:\\BAT\\");
        fileOpener.openFromCurrentLine();
    }));
    vscode.workspace.onWillSaveTextDocument(() => new VSCodeSaver().onBeforeSave());
    vscode.workspace.onDidSaveTextDocument(() => new VSCodeSaver().onAfterSave());
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
        (currentFile) => { editor.openFile(currentFile); },
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}