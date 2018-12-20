import { CobolWordFinder, Path, Editor, RechPosition, ParagraphDocumentationExtractor, CobolDocParser, File, CobolDeclarationResolver, SourceExpander, GeradorCobol } from 'rech-editor-vscode';

/**
 * Class for extracting and pulling comment from Cobol paragraphs and variables
 */
export class CommentPuller {

    /**
     * Pulls the comment from the element located on the cursor
     */
    public pullCommentFromCursor(): void {
        let editor = new Editor();
        let buffer = editor.getEditorBuffer();
        let bufferLines = buffer.split("\n");
        let position = editor.getCursors()[0];
        let file = editor.getCurrentFileName();
        this.pullCommentFromElement(buffer, position.line, position.column, file).then(comment => {
            if (comment.trim().length == 0) {
                new Editor().showWarningMessage("Sem comentário vinculado.");
            } else {
                let previousLine = bufferLines[position.line - 1];
                let previousComment = new CobolDocParser().parseSingleLineCobolDoc(previousLine).comment;
                if (previousComment.trim() !== comment.trim()) {
                    new GeradorCobol().insertCommentLineWithText(comment).then(() => {
                        new Editor().setCursor(position.line + 1, position.column);
                    });
                }
            }
        }).catch(() => {
            new Editor().showWarningMessage("Declaração não encontrada. Não é possível buscar o comentário.");
        });
    }

    /**
     * Pulls the coment from the element located on the specified line and column
     *
     * @param buffer document buffer
     * @param column line where the cursor is positioned
     * @param column column where the cursor is positioned
     * @param file file currently open
     */
    public pullCommentFromElement(buffer: string, line: number, column: number, file: string): Promise<string> {
        let bufferLines = buffer.split("\n");
        var currentLine = bufferLines[line];
        let word = new CobolWordFinder().findWordAt(currentLine, column);
        return new Promise<string>((resolve, reject) => {
            new CobolDeclarationResolver()
                .setSourceExpanderCallback((cacheFileName: string) => {
                    let fileName = new Path(file).fileName();
                    new Editor().showInformationMessage("Pré-processando " + fileName + " para buscar o comentário de " + word + "...");
                    return new SourceExpander().createExpanderExecutionPromise([file, cacheFileName]);
                })
                .findDeclaration(buffer, word, file).then(location => {
                    if (location) {
                        resolve(this.extractCommentFromDefinition(location, bufferLines, file));
                    } else {
                        reject();
                    }
                });
        });
    }

    /**
     * Extracts the comment from the element on the specified location
     *
     * @param location location where the element is declared
     * @param bufferLines lines on the buffer
     * @param currentOpenedFile current file opened in editor
     */
    private extractCommentFromDefinition(location: RechPosition, bufferLines: string[], currentOpenedFile: string): string {
        if (location.file) {
            let buffer: string[] = [];
            if (location.file == currentOpenedFile) {
                buffer = bufferLines;
            } else {
                buffer = new File(location.file).loadBufferSync("latin1").split("\n");
            }
            let docArray = new ParagraphDocumentationExtractor().getParagraphDocumentation(buffer, location.line);
            let doc = new CobolDocParser().parseCobolDoc(docArray);
            return doc.comment;
        }
        return "";
    }

}
