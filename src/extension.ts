'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Editor } from 'rech-editor-vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.openFontesTrunk', () => {
        // TODO: this command must be transferred to rech-editor-internal
        // The code you place here will be executed every time your command is executed
        var editor = new Editor();
        editor.showOpenDialog(
            'F:\\FONTES\\',
            (currentFile) => { editor.openFile(currentFile) },
        );
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.openScripts', () => {
        // TODO: this command must be transferred to rech-editor-internal
        // The code you place here will be executed every time your command is executed
        var editor = new Editor();
        editor.showOpenDialog(
            'F:\\BAT\\',
            (currentFile) => { editor.openFile(currentFile) },
        );
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}