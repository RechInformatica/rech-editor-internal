'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commands } from 'vscode';
import { Editor, Executor, Compiler, GeradorCobol, cobolDiagnosticFilter} from 'rech-editor-cobol';
import { WorkingCopy } from './wc/WorkingCopy';
import { VSCodeSaver } from './save/VSCodeSaver';
import { FonGrep } from './fongrep/fongrep';
import { FileOpener } from './open/FileOpener';
import { Preproc } from './preproc/preproc';
import { OpenWFPF } from './open/OpenWFPF';
import { SourcePreprocessor } from './preproc/SourcePreprocessor';
import { CommentPuller } from './comment/CommentPuller';

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
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.RechWindowDesigner', async () => {
        let FileName = new Editor().getCurrentFileBaseName();
        await commands.executeCommand('workbench.action.terminal.focus');
        await commands.executeCommand('workbench.action.terminal.sendSequence', { text: `RWD ${FileName} \u000d`});
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
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.update', () => {
        new Editor().showInformationMessage("Executando Update...");
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\Update.bat");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.commit', () => {
        new Editor().showInformationMessage("Executando Commit...");
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\Commit.bat");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.checkout', () => {
        WorkingCopy.checkoutFonte(new Editor().getCurrentFileBaseName());
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.compile', () => {
        new Compiler().compileCurrentFile();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.indent', () => {
        new Editor().indent("N");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.indentLeft', () => {
        new Editor().indent("E");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.indentRight', () => {
        new Editor().indent("D");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.preprocess0', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("0");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.preprocess1', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("1");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.preprocess2', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("2");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.preprocess3', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("3");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.preprocess4', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("4");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.preprocess5', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("5");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.preprocess6', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("6");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.preprocess7', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("7");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.preprocess8', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("8");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.wm', () => {
        let fileName = new Editor().getCurrentFileBaseNameWithoutExtension();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\WM.bat " + fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.fcw_bet', () => {
        let fileName = new Editor().getCurrentFileBaseName();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\FCW.bat BET " + fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.fcw_ofi', () => {
        let fileName = new Editor().getCurrentFileBaseName();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\FCW.bat OFI " + fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.fcw_est', () => {
        let fileName = new Editor().getCurrentFileBaseName();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\FCW.bat EST " + fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.fcw_versao', () => {
        let editor = new Editor();
        editor.showInputBox("Informe a versão a ser realizado o FCW", "FCW", (info) => {
            let fileName = editor.getCurrentFileBaseName();
            new Executor().runAsync("start cmd.exe /c F:\\BAT\\FCW.bat " + info + " " + fileName);
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.fonlbrlog', () => {
        let fileName = new Editor().getCurrentFileBaseName();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\FONLBRLOG.bat " + fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.fonteslog', () => {
        let fileName = new Editor().getCurrentFileBaseName();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\FONTESLOG.bat " + fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.lis', () => {
        let editor = new Editor();
        let fileName = editor.getCurrentFileBaseNameWithoutExtension();
        let directory = editor.getCurrentFileDirectory();
        new Executor().runAsync('start cmd.exe /c F:\\BAT\\PSPADLIS.bat ' + directory + fileName + '*');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.lisbk', () => {
        let editor = new Editor();
        let fileName = editor.getCurrentFileBaseNameWithoutExtension();
        let extension = editor.getCurrentFileBaseNameExtension();
        let directory = editor.getCurrentFileDirectory();
        new Executor().runAsync('start cmd.exe /c F:\\BAT\\PSPADLISBK.bat ' + directory + ' ' + fileName + ' ' + extension);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.listbk', () => {
        let editor = new Editor();
        let fileName = editor.getCurrentFileBaseName();
        editor.showInputBox("Informe o fonte a realizar o LISTBK", "LISTBK", (info) => {
            if (info !== undefined && info.length > 0){
                new Executor().runAsync('start cmd.exe /c F:\\BAT\\LISTBK.bat ' + ' ' + info);
            } else{
                editor.showInformationMessage("Não foi informada o fonte a listar!");
            }
        }, fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.blame', () => {
        let editor = new Editor();
        let fileName = editor.getCurrentFileBaseName();
        editor.showInputBox("Informe o fonte a realizar o BLAME", "BLAME", (info) => {
            if (info !== undefined && info.length > 0){
                new Executor().runAsync('start cmd.exe /c F:\\BAT\\BLAME.bat ' + ' ' + info);
            } else{
                editor.showInformationMessage("Não foi informada o fonte a executar!");
            }
        }, fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.aplicaspd', () => {
        new Executor().runAsync('start cmd.exe /c F:\\BAT\\APLICASPD.bat ');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.autogrep', () => {
        new Executor().runAsync('start cmd.exe /c F:\\BAT\\AUTOGREP.bat ');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('rech.editor.internal.pullComment', () => {
        new CommentPuller().pullCommentFromCursor();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.editorScrollUp', () => {
        commands.executeCommand('editorScroll', { to: 'up', by: 'line', value: 1, revealCursor: true });
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.editorScrollDown', () => {
        commands.executeCommand('editorScroll', { to: 'down', by: 'line', value: 1, revealCursor: true });
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.newLineAbove', () => {
        new GeradorCobol().newLineAbove();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.findNextBlankLine', () => {
        new Editor().findNextBlankLine();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.findPreviousBlankLine', () => {
        new Editor().findPreviousBlankLine();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.findWordForward', () => {
        commands.executeCommand("editor.action.addSelectionToNextFindMatch");
        commands.executeCommand("editor.action.nextMatchFindAction");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.findWordBackward', () => {
        commands.executeCommand("editor.action.addSelectionToNextFindMatch");
        commands.executeCommand("editor.action.previousMatchFindAction");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.replaceWordUnderCursor', () => {
        new Editor().clipboardReplaceWord();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.copyWordUnderCursor', () => {
        new Editor().clipboardCopyWord();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.cobolUpdateLineDots', () => {
        new GeradorCobol().updateLineDots();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.copyLine', () => {
        commands.executeCommand("editor.action.clipboardCopyAction");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.pasteLine', () => {
        new GeradorCobol().pasteLine();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.replaceLine', () => {
        commands.executeCommand("editor.action.deleteLines");
        new GeradorCobol().pasteLine();
    }));
    vscode.workspace.onWillSaveTextDocument(() => new VSCodeSaver().onBeforeSave());
    vscode.workspace.onDidSaveTextDocument(() => new VSCodeSaver().onAfterSave());
    defineSourceExpander();
    definePreprocessor();
    defineDianosticConfigs();
}

/**
 * Sets the global source expander which is responsible for executing Cobol Preprocessor
 */
function defineSourceExpander() {
    var preproc = new Preproc();
    preproc.setOptions(["-scc", "-as="]);
    Editor.setSourceExpander(preproc);
}

/**
 * Sets the global source compile which is responsible for executing Cobol Compile
 */
function definePreprocessor() {
    var preproc = new Preproc();
    preproc.setOptions(["-cpn", "-msi", "-scc", "-vnp", "-war", "-wes", "-wop=w077;w078;w079"]);
    Editor.setPreprocessor(preproc);
}

/**
 * Sets configurations for Cobol source diagnostic
 */
function defineDianosticConfigs() {
    let autodiagnostic = <Boolean> vscode.workspace.getConfiguration("rech.editor.internal").get("autodiagnostic");
    if (autodiagnostic) {
        cobolDiagnosticFilter.setAutoDiagnostic(true);
        let noShowWarnings = <string[]> vscode.workspace.getConfiguration("rech.editor.internal").get("diagnosticfilter");
        cobolDiagnosticFilter.setNoShowWarnings(noShowWarnings);
    }
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