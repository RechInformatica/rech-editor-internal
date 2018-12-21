import { CobolWordFinder, Path, Editor, RechPosition, ParagraphDocumentationExtractor, CobolDocParser, File, SourceExpander, GeradorCobol, CobolDeclarationFinder } from 'rech-editor-vscode';

/* Max number of lines to look for a flag parent */
const MAX_LINES_FLAG_PARENT = 2;

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
    private extractCommentFromCopy(copyFileName: string): string[] {
        let comment = "";
        let file = new File(copyFileName);
        if (file.exists()) {
            let copyBuffer = file.loadBufferSync("latin1").split("\n");
            if (copyBuffer.length > 0) {
                comment = copyBuffer[1];
                if (this.isWorkingFd(copyFileName)) {
                    comment = this.buildWorkingFdComment(comment);
                }
            }
        }
        return new CobolDocParser().parseSingleLineCobolDoc(comment).comment;
    }

    /**
     * Returns true if the copy represents a Working
     *
     * @param copyFileName copy filename
     */
    private isWorkingFd(copyFileName: string) {
        return copyFileName.toUpperCase().includes("WREG");
    }

    /**
     * Builds the final Working FD comment
     *
     * @param comment comment extracted from the Working FD header
     */
    private buildWorkingFdComment(comment: string): string {
        let description = /Descrição:(.*)/.exec(comment);
        if (description && description[1]) {
            return "      *>-> Registro de Working do arquivo de " + description[1].replace("<*", "").trim();
        }
        return comment;
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
     * @param comments comments to be inserted
     * @param cursor cursor position
     * @param bufferLines source buffer lines
     */
    private handleCommentPulling(comments: string[], cursor: RechPosition, bufferLines: string[]): void {
        if (comments.length == 0) {
            new Editor().showWarningMessage("Sem comentário vinculado.");
        } else {
            let previousLine = bufferLines[cursor.line - 1];
            if (!this.isPreviousCommentEqual(previousLine, comments)) {
                this.insertCommentsInEditor(comments, cursor);
            }
        }
    }

    /**
     * Returns true if the previous comment is equal to the last line of the comment to be inserted
     *
     * @param previousLine previous comment
     * @param comments comments to be inserted
     */
    private isPreviousCommentEqual(previousLine: string,  comments: string[]): boolean {
        let previousComment = new CobolDocParser().parseSingleLineCobolDoc(previousLine).comment;
        return previousComment.length > 0 && previousComment[previousComment.length - 1].trim() === comments[comments.length - 1].trim();
    }

    /**
     * Inserts the specified comments in the editor
     *
     * @param comments comments to be inserted
     * @param cursor cursor position
     */
    private async insertCommentsInEditor(comments: string[], cursor: RechPosition) {
        for (let i = comments.length - 1; i >= 0; i--) {
            await new GeradorCobol().insertCommentLineWithText(comments[i]);
        }
        await new Editor().setCursor(cursor.line + comments.length, cursor.column);
    }

    /**
     * Extracts the comment from the element on the specified location
     *
     * @param location location where the element is declared
     * @param bufferLines lines on the buffer
     */
    private extractCommentFromDefinition(location: RechPosition, bufferLines: string[]): string[] {
        let buffer: string[] = [];
        // If the delcaration was found on an external file
        if (location.file) {
            buffer = new File(location.file).loadBufferSync("latin1").split("\n");
        } else {
            buffer = bufferLines;
        }
        let targetLine = this.getAppropriateDeclarationLine(location, buffer);
        let docArray = new ParagraphDocumentationExtractor().getParagraphDocumentation(buffer, targetLine);
        let doc = new CobolDocParser().parseCobolDoc(docArray);
        return doc.comment;
    }

    /**
     * Returns the appropriate declaration line.
     *
     * When one try to extract a boolean's comment sometimes it is necessary to extract the parent's comment.
     *
     * @param location location where the element is declared
     * @param bufferLines lines on the buffer
     */
    private getAppropriateDeclarationLine(location: RechPosition, bufferLines: string[]): number {
        if (this.isBooleanFlag(bufferLines[location.line])) {
            return this.findParentVariableLine(location, bufferLines);
        }
        return location.line;
    }

    /**
     * Returns the boolean flag parent location
     *
     * @param location location where the element is declared
     * @param bufferLines lines on the buffer
     */
    private findParentVariableLine(location: RechPosition, bufferLines: string[]): number {
        if (bufferLines.length < MAX_LINES_FLAG_PARENT) {
            return location.line;
        }
        for (let i = 1; i <= MAX_LINES_FLAG_PARENT; i++) {
            let currentLine = bufferLines[location.line - i];
            if (!this.isBooleanFlag(currentLine) && !currentLine.trim().startsWith("*>")) {
                return location.line - i;
            }
        }
        return location.line;
    }

    /**
     * Returns true if the specified line represents a SIM or NAO boolean flag
     *
     * @param currentLine current line text
     */
    private isBooleanFlag(currentLine: string): boolean {
        let upperLine = currentLine.toUpperCase();
        if (/\s+(88).*/.exec(upperLine) && (upperLine.includes("SIM ") || upperLine.includes("NAO "))) {
            return true;
        }
        return false;
    }

}
