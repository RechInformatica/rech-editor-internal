'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commands } from 'vscode';
import { Editor, Executor, Compiler } from 'rech-editor-vscode';
import { WorkingCopy } from './wc/WorkingCopy';
import { VSCodeSaver } from './save/VSCodeSaver';
import { FonGrep } from './fongrep/fongrep';
import { FileOpener } from './open/FileOpener';
import { Preproc } from './preproc/preproc';
import { OpenWFPF } from './open/OpenWFPF';
import { SourcePreprocessor } from './preproc/SourcePreprocessor';

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
        WorkingCopy.current().then((wc) => {
            showOpenDialog(wc.getSourcesDir());
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.fonGrep', () => {
        var editor = new Editor();
        var fongrep = new FonGrep();
        var text = editor.getSelectionBuffer()[0];
        if (text === '') {
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
        fileOpener.addPathForFileSearching("F:\\");
        fileOpener.openFromCurrentLine();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.OpenWFPF', () => {
        new OpenWFPF().open();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.update', () => {
        new Editor().showInformationMessage("Executando Update...")
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\Update.bat");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.commit', () => {
        new Editor().showInformationMessage("Executando Commit...")
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\Commit.bat");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.checkout', () => {
        WorkingCopy.checkoutFonte(new Editor().getCurrentFileBaseName());
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.compile', () => {
        new Compiler().compileCurrentFile();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.indent', () => {
        new Editor().indent("N");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.indentLeft', () => {
        new Editor().indent("E");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.indentRight', () => {
        new Editor().indent("D");
    }));    
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.preprocess0', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("0");
    }));    
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.preprocess1', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("1");
    }));    
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.preprocess2', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("2");
    }));    
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.preprocess3', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("3");
    }));    
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.preprocess4', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("4");
    }));    
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.preprocess5', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("5");
    }));    
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.preprocess6', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("6");
    }));    
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.preprocess7', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("7");
    }));    
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.vscode.preprocess8', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("8");
    }));    
    vscode.workspace.onWillSaveTextDocument(() => new VSCodeSaver().onBeforeSave());
    vscode.workspace.onDidSaveTextDocument(() => new VSCodeSaver().onAfterSave());
    defineSourceExpander();
}

/**
 * Sets the global source expander which is responsible for executing Cobol Preprocessor
 */
function defineSourceExpander() {
    var preproc = new Preproc();
    preproc.setOptions(["-scc", "-sco", "-as="]);
    Editor.setSourceExpander(preproc);
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