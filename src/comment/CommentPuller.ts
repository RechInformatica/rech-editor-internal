import { CobolWordFinder, Path, Editor, RechPosition, ParagraphDocumentationExtractor, CobolDocParser, File, SourceExpander, GeradorCobol, CobolDeclarationFinder } from 'rech-editor-vscode';

/**
 * Class for extracting and pulling comment from Cobol paragraphs and variables
 */
export class CommentPuller {

    /**
     * Pulls the comment from the element located on the cursor
     */
    public pullCommentFromCursor(): void {
        let editor = new Editor();
        let cursor = editor.getCursors()[0];
        let buffer = editor.getEditorBuffer();
        let bufferLines = buffer.split("\n");
        let file = editor.getCurrentFileName();
        let word = new CobolWordFinder().findWordAt(bufferLines[cursor.line], cursor.column);
        new CobolDeclarationFinder(buffer)
            .findDeclaration(word, file, (cacheFileName: string) => {
                return this.fireSourceExpander(word, file, cacheFileName);
            })
            .then((position: RechPosition) => {
                this.handleCommentPulling(cursor, position, bufferLines);
            })
            .catch(() => {
                new Editor().showWarningMessage("Declaração de '" + word + "' não encontrada. Não é possível buscar o comentário.");
            });
    }

    /**
     * Fires source expander execution
     *
     * @param word target word
     * @param file file name
     * @param cacheFileName cache file name
     */
    private fireSourceExpander(word: string, file: string, cacheFileName: string): Promise<string> {
        let fileName = new Path(file).fileName();
        new Editor().showInformationMessage("Pré-processando " + fileName + " para buscar o comentário de '" + word + "'...");
        return new SourceExpander().createExpanderExecutionPromise([file, cacheFileName]);
    }

    /**
     * Handles the comment pulling
     *
     * @param cursor original position where cursor was positioned when this feature has been triggered
     * @param position position from where comment will be pulled
     * @param bufferLines buffer lines
     */
    private handleCommentPulling(cursor: RechPosition, position: RechPosition, bufferLines: string[]): void {
        let comment = this.extractCommentFromDefinition(position, bufferLines);
        if (comment.trim().length == 0) {
            new Editor().showWarningMessage("Sem comentário vinculado.");
        } else {
            let previousLine = bufferLines[cursor.line - 1];
            let previousComment = new CobolDocParser().parseSingleLineCobolDoc(previousLine).comment;
            if (previousComment.trim() !== comment.trim()) {
                new GeradorCobol().insertCommentLineWithText(comment).then(() => {
                    new Editor().setCursor(cursor.line + 1, cursor.column);
                });
            }
        }
    }

    /**
     * Extracts the comment from the element on the specified location
     *
     * @param location location where the element is declared
     * @param bufferLines lines on the buffer
     * @param currentOpenedFile current file opened in editor
     */
    private extractCommentFromDefinition(location: RechPosition, bufferLines: string[]): string {
        let buffer: string[] = [];
        // If the delcaration was found on an external file
        if (location.file) {
            buffer = new File(location.file).loadBufferSync("latin1").split("\n");
        } else {
            buffer = bufferLines;
        }
        let docArray = new ParagraphDocumentationExtractor().getParagraphDocumentation(buffer, location.line);
        let doc = new CobolDocParser().parseCobolDoc(docArray);
        return doc.comment;
    }

}
