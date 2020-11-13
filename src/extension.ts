'use strict';
// The module 'vscode' contains  the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, workspace, ExtensionContext, TextDocument, window, OpenDialogOptions, Uri } from 'vscode';
import { Editor, Executor, GeradorCobol, Path, CobolDiagnosticFilter} from 'rech-editor-cobol';
import { Compiler } from './compiler/compiler';
import { WorkingCopy } from './wc/WorkingCopy';
import { VSCodeSaver } from './save/VSCodeSaver';
import { FonGrep } from './fongrep/fongrep';
import { FileOpener } from './open/FileOpener';
import { Preproc } from './preproc/preproc';
import { SourcePreprocessor } from './preproc/SourcePreprocessor';
import { CommentPuller } from './comment/CommentPuller';
import { ReadOnlyControll } from './readonly/ReadOnlyControll';
import { Matcher } from './open/Matcher';
import { CobolLowercaseConverter } from './editor/CobolLowerCaseConverter';
import { UpdateNotification } from './notification/UpdateNotification';
import { PreprocStatusBar } from './preproc/PreprocStatusBar';
import { IntelligentReplace } from './codeProcess/IntelligentReplace';
import { QuickOpen } from './open/QuickOpen';
import { ExternalScriptValidator } from './preproc/ExternalScriptValidator';
import { ExecutorWrapper } from './preproc/ExecutorWrapper';
import { SpecialClassPuller } from './specialClassPuller/SpecialClassPuller';
import { OpenSuffixedFiles } from './open/OpenSuffixedFiles';
import { BatGrep } from './fongrep/BatGrep';
import { OpenDebugSource } from './open/OpenDebugSource';
import { CodeCommentator } from './editor/CodeCommentator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(_context: any) {
    const context = <ExtensionContext>_context;
    // Build the status bar from preproc
    PreprocStatusBar.buildStatusBar();
    // Register extension commands
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.openFontesTrunk', () => {
        showOpenDialog('F:\\FONTES\\', 'Abrir fonte do trunk');
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.openCurrentSource', () => {
        showOpenDialog(new Editor().getCurrentFileName());
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.openScripts', () => {
        showOpenDialog('F:\\BAT\\', 'Abrir script');
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.openWc', () => {
        WorkingCopy.current().then((wc) => {
            showOpenDialog(wc.getFonDir(), 'Abrir fonte do working-copy');
        }).catch(() => {
            new Editor().showWarningMessage("Working-copy not found");
        });
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.quickOpen', () => {
        const editor = new Editor();
        editor.showInformationMessage("Carregando versões...");
        QuickOpen.build().then((quickOpen) => {
            quickOpen.showOpenDialog();
        }).catch(() => {
        });
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.fonGrep', () => {
        const editor = new Editor();
        const fongrep = new FonGrep();
        const version = new Matcher().getVersionFromLine(editor.getCurrentFileDirectory());
        let text = editor.getSelectionBuffer()[0];
        if (text === '') {
            text = editor.getCurrentWord();
        }
        fongrep.fonGrep(text, version);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.batGrep', () => {
        const editor = new Editor();
        const batGrep = new BatGrep();
        let text = editor.getSelectionBuffer()[0];
        if (text === '') {
            text = editor.getCurrentWord();
        }
        batGrep.batGrep(text);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.RechWindowDesigner', async () => {
        const FileName = new Editor().getCurrentFileName();
        await commands.executeCommand('workbench.action.terminal.focus');
        await commands.executeCommand('workbench.action.terminal.sendSequence', { text: `RWD ${FileName} \u000d`});
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.openThis', () => {
        const fileOpener = new FileOpener();
        fileOpener.addPathForFileSearching("F:\\FONTES\\");
        fileOpener.addPathForFileSearching("F:\\BAT\\");
        fileOpener.addPathForFileSearching("F:\\");
        fileOpener.addPathForFileSearching("C:\\FONTES\\java\\des\\JRISiger\\src\\main\\java\\");
        fileOpener.addPathForFileSearching("C:\\FONTES\\java\\des\\JRIWebServiceApi\\src\\main\\java\\");
        fileOpener.addPathForFileSearching("C:\\FONTES\\java\\des\\JRIRechApplicationServer\\src\\main\\java\\");
        fileOpener.addPathForFileSearching("C:\\FONTES\\java\\des\\JRIUtil\\src\\main\\java\\");
        fileOpener.addPathForFileSearching("C:\\FONTES\\java\\des\\JRISocketUtils\\src\\main\\java\\");
        fileOpener.addPathForFileSearching("F:\\FONTES\\java\\JRISiger\\src\\main\\java\\");
        fileOpener.addPathForFileSearching("F:\\FONTES\\java\\JRIWebServiceApi\\src\\main\\java\\");
        fileOpener.addPathForFileSearching("F:\\FONTES\\java\\JRIRechApplicationServer\\src\\main\\java\\");
        fileOpener.addPathForFileSearching("F:\\FONTES\\java\\JRIUtil\\src\\main\\java\\");
        fileOpener.addPathForFileSearching("F:\\FONTES\\java\\JRISocketUtils\\src\\main\\java\\");
        fileOpener.openFromCurrentLine();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.OpenDebugSource', () => {
        new OpenDebugSource().open();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.OpenWFPF', () => {
        const suffixes: string[] = ["WF.CPY", "PF.CPY"];
        new OpenSuffixedFiles().open(suffixes);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.OpenGuiFiles', () => {
        const suffixes: string[] = ["WT.CPY", "PT.CPY", "GW.CPB", "GP.CPB"];
        new OpenSuffixedFiles().open(suffixes);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.update', () => {
        new Editor().showInformationMessage("Executando Update...");
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\Update.bat");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.commit', () => {
        new Editor().showInformationMessage("Executando Commit...");
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\Commit.bat");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.checkout', (file?) => {
        let fileName: string;
        if (file) {
            fileName = new Path(file).fileName();
        } else {
            fileName = new Editor().getCurrentFileBaseName();
        }
        WorkingCopy.checkoutFonte(fileName);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.checkoutdic', () => {
        new Editor().showInformationMessage("Executando checkout do dicionário...");
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\CheckoutDic.bat");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.cleardic', () => {
        new Editor().showInformationMessage("Limpando o dicionário do diretório por programador...");
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\ClearDic.bat");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.compile', () => {
        new Compiler().compileCurrentFile().then().catch();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.preprocess0', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("0");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.preprocess1', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("1");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.preprocess2', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("2");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.preprocess3', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("3");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.preprocess4', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("4");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.preprocess5', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("5");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.preprocess6', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("6");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.preprocess7', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("7");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.preprocess8', () => {
        new SourcePreprocessor().runPreprocOnCurrentSource("8");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.wm', () => {
        const fileName = new Editor().getCurrentFileBaseNameWithoutExtension();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\WM.bat " + fileName);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.fcw_bet', () => {
        const fileName = new Editor().getCurrentFileBaseName();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\FCW.bat BET " + fileName);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.fcw_ofi', () => {
        const fileName = new Editor().getCurrentFileBaseName();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\FCW.bat OFI " + fileName);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.fcw_est', () => {
        const fileName = new Editor().getCurrentFileBaseName();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\FCW.bat EST " + fileName);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.fcw_versao', () => {
        const editor = new Editor();
        editor.showInputBox("Informe a versão a ser realizado o FCW", "FCW", (info) => {
            const fileName = editor.getCurrentFileBaseName();
            new Executor().runAsync("start cmd.exe /c F:\\BAT\\FCW.bat " + info + " " + fileName);
        });
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.fonlbrlog', () => {
        const fileName = new Editor().getCurrentFileBaseName();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\FONLBRLOG.bat " + fileName);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.intelligentReplace', () => {
        const command = workspace.getConfiguration("rech.editor.internal").get<string>("IntelligentReplaceProcessor")
        const file = workspace.getConfiguration("rech.editor.internal").get<string>("IntelligentReplaceFileBuffer")
        if (command && file) {
            IntelligentReplace.run(command, file)
        }
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.fonteslog', () => {
        const fileName = new Editor().getCurrentFileBaseName();
        new Executor().runAsync("start cmd.exe /c F:\\BAT\\FONTESLOG.bat " + fileName);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.lis', () => {
        const editor = new Editor();
        const fileName = editor.getCurrentFileBaseNameWithoutExtension();
        const directory = editor.getCurrentFileDirectory();
        new Executor().runAsync('start cmd.exe /c F:\\BAT\\PSPADLIS.bat ' + directory + fileName + '*');
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.lisbk', () => {
        const editor = new Editor();
        const fileName = editor.getCurrentFileBaseNameWithoutExtension();
        const extension = editor.getCurrentFileBaseNameExtension();
        const directory = editor.getCurrentFileDirectory();
        new Executor().runAsync('start cmd.exe /c F:\\BAT\\PSPADLISBK.bat ' + directory + ' ' + fileName + ' ' + extension);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.listbk', () => {
        const editor = new Editor();
        const fileName = editor.getCurrentFileBaseName();
        editor.showInputBox("Informe o fonte a realizar o LISTBK", "LISTBK", (info) => {
            if (info !== undefined && info.length > 0){
                new Executor().runAsync('start cmd.exe /c F:\\BAT\\LISTBK.bat ' + ' ' + info);
            } else{
                editor.showInformationMessage("Não foi informada o fonte a listar!");
            }
        }, fileName);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.blame', () => {
        const editor = new Editor();
        const fileName = editor.getCurrentFileBaseName();
        editor.showInputBox("Informe o fonte a realizar o BLAME", "BLAME", (info) => {
            if (info !== undefined && info.length > 0){
                new Executor().runAsync('start cmd.exe /c F:\\BAT\\BLAME.bat ' + ' ' + info);
            } else{
                editor.showInformationMessage("Não foi informada o fonte a executar!");
            }
        }, fileName);
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.clearprog', async () => {
        await commands.executeCommand('workbench.output.action.clearOutput');
        const editor = new Editor();
        editor.showInformationMessage("Executando teste unitário...")
        const FileName = new Editor().getCurrentFileBaseName();
        await commands.executeCommand('workbench.action.terminal.focus');
        await commands.executeCommand('workbench.action.terminal.sendSequence', { text: `F:\\BAT\\ClearProg.bat ${FileName} Y  \u000d`});
        await commands.executeCommand('workbench.action.focusActiveEditorGroup');
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.aplicaspd', () => {
        new Executor().runAsync('start cmd.exe /c F:\\BAT\\APLICASPD.bat ');
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.autogrep', () => {
        new Executor().runAsync('start cmd.exe /c F:\\BAT\\AUTOGREP.bat ');
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.pullComment', () => {
        new CommentPuller().pullCommentFromCursor();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.editorScrollUp', () => {
        commands.executeCommand('editorScroll', { to: 'up', by: 'line', value: 1, revealCursor: true });
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.editorScrollDown', () => {
        commands.executeCommand('editorScroll', { to: 'down', by: 'line', value: 1, revealCursor: true });
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.newLineAbove', () => {
        new GeradorCobol().newLineAbove().then().catch();
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
        new GeradorCobol().updateLineDots().then().catch();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.copyLine', () => {
        commands.executeCommand("editor.action.clipboardCopyAction");
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.pasteLine', () => {
        new GeradorCobol().pasteLine().then().catch();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.replaceLine', () => {
        commands.executeCommand("editor.action.deleteLines");
        new GeradorCobol().pasteLine().then().catch();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.convertToLowerCase', () => {
        const editor = new Editor();
        editor.selectWholeLines();
        editor.replaceSelection(CobolLowercaseConverter.convert(editor.getSelectionBuffer()));
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.commentLine', () => {
        CodeCommentator.applyInSelectedSource();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.runTest', async () => {
        await commands.executeCommand('workbench.output.action.clearOutput');
        const editor = new Editor();
        editor.showInformationMessage("Executando teste unitário...")
        const FileName = new Editor().getCurrentFileBaseName();
        await commands.executeCommand('workbench.action.terminal.focus');
        await commands.executeCommand('workbench.action.terminal.sendSequence', { text: `F:\\BAT\\Tst.bat ${FileName}  \u000d`});
        await commands.executeCommand('workbench.action.focusActiveEditorGroup');
    }));
    workspace.onWillSaveTextDocument(() => new VSCodeSaver().onBeforeSave());
    workspace.onDidSaveTextDocument(() => new VSCodeSaver().onAfterSave());
    workspace.onDidChangeTextDocument((change) => {
        ReadOnlyControll.check(change.document.uri.fsPath);
    });
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.configureSourceExpander', () => {
        return defineSourceExpander();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.configurePreprocessor', () => {
        return definePreprocessor();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.configureDianosticProperties', () => {
        return defineDianosticConfigs();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.configureCopyHierarchyFunction', () => {
        return defineCopyHierarchyFunction();
    }));
    context.subscriptions.push(commands.registerCommand('rech.editor.internal.configureSpecialClassPullerFunction', () => {
        return defineSpecialClassPullerFunction();
    }));
    workspace.onDidOpenTextDocument((textDocument: TextDocument) => {
        checkRubyFileEncoding(textDocument);
    })
    workspace.onDidSaveTextDocument((textDocument: TextDocument) => {
        checkRubyFileEncoding(textDocument);
    })
    UpdateNotification.showUpdateMessageIfNeed();
}

/**
 * Checks if the encoding rules for ruby ​​programs have been respected
 */
function checkRubyFileEncoding(textDocument: TextDocument) {
    if (isRubyFile(new Path(textDocument.uri))) {
        if (isUTF8rubyFile(textDocument.getText())) {
            textDocument
            const optionButton = "Alterar Encoding";
            window.showWarningMessage("Atenção o arquivo que você está editando está configurado para ser utf-8!\nCosidere alterar o encoding do arquivo caso não esteja aberto corretamente.", optionButton).then((option) => {
                if (option == optionButton) {
                    commands.executeCommand("workbench.action.editor.changeEncoding");
                }
            })
        }
    }
}

/**
 * Returns true if the path represents a ruby file
 *
 * @param path
 */
function isRubyFile(path: Path): boolean {
    return path.extension() == ".rb";
}

/**
 * Returns true if the buffer represents a ruby file in UTF8
 *
 * @param buffer
 */
function isUTF8rubyFile(buffer: String): boolean {
    const match = buffer.match(/#\s+encoding\:(.*)/i);
    if (match && match[1]) {
        return match[1].trim().toLowerCase() == "utf-8";
    }
    return false;
}

/**
 * Sets the global source expander which is responsible for executing Cobol Preprocessor
 */
function defineSourceExpander() {
    const preproc = new Preproc();
    return preproc.setOptions(["-scc", "-as="]);
}

/**
 * Sets the global source compile which is responsible for executing Cobol Compile
 */
function definePreprocessor() {
    const executorList = new ExecutorWrapper();
    executorList.addExecutor(new Preproc().setOptions(["-cpn", "-spn", "-sco", "-msi", "-vnp", "-war", "-wes", "-cem", "-wop=w077;w078;w079"]));
    executorList.addExecutor(new ExternalScriptValidator());
    return executorList;
}

/**
 * Sets the global funtion to return the copy hierarchy of source
 */
function defineCopyHierarchyFunction() {
    const preproc = new Preproc();
    return preproc.setOptions(["-hc"]);
}

/**
 * Sets the global funtion to return the copy hierarchy of source
 */
function defineSpecialClassPullerFunction() {
    return new SpecialClassPuller();
}

/**
 * Sets configurations for Cobol source diagnostic
 */
function defineDianosticConfigs() {
    const autodiagnostic = <"onChange" | "onSave" | boolean> workspace.getConfiguration("rech.editor.internal").get("autodiagnostic");
    if (autodiagnostic) {
        const diagnosticFilter = new CobolDiagnosticFilter();
        diagnosticFilter.setAutoDiagnostic(autodiagnostic);
        const noShowWarnings = <string[]> workspace.getConfiguration("rech.editor.internal").get("diagnosticfilter");
        diagnosticFilter.setNoShowWarnings(noShowWarnings);
        return diagnosticFilter;
    }
}

/**
 * Opens dialog for file selection and automatically opens the files in editor
 *
 * @param defaultDir default directory
 * @param title dialog title
 */
function showOpenDialog(defaultDir: string, title?: string) {
    const options: OpenDialogOptions = {
        openLabel: 'Abrir arquivo',
        defaultUri: defaultDir ? Uri.file(defaultDir) : undefined,
        title: title
    };
    window.showOpenDialog(options).then(selectedFiles => {
        if (selectedFiles) {
            selectedFiles.forEach(currentFile => new Editor().openFileInsensitive(currentFile.fsPath));
        }
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}
