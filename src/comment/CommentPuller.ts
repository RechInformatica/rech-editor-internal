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
        let bufferLines = buffer.split("\r\n");
        let currentFileName = editor.getCurrentFileName();
        let currentLineText = bufferLines[cursor.line];
        switch(true) {
            case this.isCopyDeclaration(currentLineText): {
                this.handleCopyComment(currentLineText, editor.getCurrentFileDirectory(), cursor, bufferLines);
                break;
            }
            default: {
                this.handleDeclarationComment(bufferLines, cursor, buffer, currentFileName);
                break;
            }
        }
    }

    /**
     * Returns true if the current line represents a copy declaration
     *
     * @param lineText current line text
     */
    private isCopyDeclaration(lineText: string): boolean {
        if (/\s+(COPY|copy).*/.exec(lineText)) {
            return true;
        }
        return false;
    }

    /**
     * Handles the comment exraction from copy files
     *
     * @param lineText current line text
     * @param currentFileDirectory current file directory
     * @param cursor cursor position
     * @param bufferLines buffer lines
     */
    private handleCopyComment(lineText: string, currentFileDirectory: string, cursor: RechPosition, bufferLines: string[]): void {
        let copyFileName = this.extractCopyNameFromCurrentLine(lineText);
        if (copyFileName !== "") {
            let comment = this.extractCommentFromCopy(currentFileDirectory + copyFileName);
            this.handleCommentPulling(comment, cursor, bufferLines);
        }
    }

    /**
     * Extracts the copy filename from current line
     *
     * @param currentLineText current line text
     */
    private extractCopyNameFromCurrentLine(currentLineText: string): string {
        let splittedLine = currentLineText.trim().split(/[ |.]+/);
        if (splittedLine.length > 3 && splittedLine[0].toUpperCase() === "COPY") {
            return splittedLine[1] + "." + splittedLine[2];
        }
        return "";
    }

    /**
     * Extracts the comment from copy header
     *
     * @param copyFileName copy filename
     */
    private extractCommentFromCopy(copyFileName: string): string {
        let copyBuffer = new File(copyFileName).loadBufferSync("latin1").split("\n");
        let comment = "";
        if (copyBuffer.length > 0) {
            comment = copyBuffer[1];
        }
        return new CobolDocParser().parseSingleLineCobolDoc(comment).comment;
    }

    /**
     * Handles the comment exraction from element declaration
     *
     * @param bufferLines buffer lines
     * @param cursor cursor position
     * @param buffer buffer
     * @param currentFileName current file name
     */
    private handleDeclarationComment(bufferLines: string[], cursor: RechPosition, buffer: string, currentFileName: string): void {
        let word = new CobolWordFinder().findWordAt(bufferLines[cursor.line], cursor.column);
        new CobolDeclarationFinder(buffer)
            .findDeclaration(word, currentFileName, (cacheFileName: string) => {
                return this.fireSourceExpander(word, currentFileName, cacheFileName);
            })
            .then((position: RechPosition) => {
                let comment = this.extractCommentFromDefinition(position, bufferLines);
                this.handleCommentPulling(comment, cursor, bufferLines);
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
    private handleCommentPulling(comment: string, cursor: RechPosition, bufferLines: string[]): void {
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
