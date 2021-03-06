import { CobolWordFinder, Path, Editor, RechPosition, ElementDocumentationExtractor, CobolDocParser, File, SourceExpander, GeradorCobol, CobolDeclarationFinder, VariableUtils, ExpandedSourceManager, FindParameters } from 'rech-editor-cobol';
import { BufferSplitter } from "rech-ts-commons";

/**
 * Class for extracting and pulling comment from Cobol paragraphs and variables
 */
export class CommentPuller {

    /**
     * Pulls the comment from the element located on the cursor
     */
    public pullCommentFromCursor(): void {
        const editor = new Editor();
        const cursor = editor.getCursors()[0];
        const buffer = editor.getEditorBuffer();
        const bufferLines = BufferSplitter.split(buffer);
        const currentFileName = editor.getCurrentFileName();
        const currentLineText = bufferLines[cursor.line];
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
        const copyFileName = this.extractCopyNameFromCurrentLine(lineText);
        if (copyFileName !== "") {
            const comment = this.extractCommentFromCopy(currentFileDirectory + copyFileName);
            this.handleCommentPulling(comment, cursor, bufferLines);
        }
    }

    /**
     * Extracts the copy filename from current line
     *
     * @param currentLineText current line text
     */
    private extractCopyNameFromCurrentLine(currentLineText: string): string {
        const splittedLine = currentLineText.trim().split(/[ |.]+/);
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
        if (!file.exists()) {
            file = new File("F:\\Fontes\\" + new Path(file.fileName).fileName());
        }
        if (file.exists()) {
            const copyBuffer = BufferSplitter.split(file.loadBufferSync("latin1"));
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
        const description = /Descrição:(.*)/.exec(comment);
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
        const word = new CobolWordFinder().findWordAt(bufferLines[cursor.line], cursor.column);
        if (!ExpandedSourceManager.hasSourceExpander()) {
            ExpandedSourceManager.setSourceExpander((word: string, file: string) => {
                return this.fireSourceExpander(word, file, ExpandedSourceManager.buildExpandedSourceFileName(file));
            });
        }
        const params: FindParameters = {term: word, uri: currentFileName, lineIndex: cursor.line, columnIndex: cursor.column};
        new CobolDeclarationFinder(buffer)
            .findDeclaration(params)
            .then((position: RechPosition) => {
                const comment = this.extractCommentFromDefinition(position, bufferLines);
                this.handleCommentPulling(comment, cursor, bufferLines);
            })
            .catch(() => new Editor().showWarningMessage("Declaração de '" + word + "' não encontrada. Não é possível buscar o comentário."));
    }

    /**
     * Fires source expander execution
     *
     * @param word target word
     * @param file file name
     * @param cacheFileName cache file name
     */
    private fireSourceExpander(word: string, file: string, cacheFileName: string): Promise<string> {
        const fileName = new Path(file).fileName();
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
        if (comments.length === 0) {
            new Editor().showWarningMessage("Sem comentário vinculado.");
        } else {
            const previousLine = bufferLines[cursor.line - 1];
            if (!this.isPreviousCommentEqual(previousLine, comments)) {
                this.insertCommentsInEditor(comments, cursor).then().catch();
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
        const previousComment = new CobolDocParser().parseSingleLineCobolDoc(previousLine).comment;
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
            buffer = BufferSplitter.split(new File(location.file).loadBufferSync("latin1"));
        } else {
            buffer = bufferLines;
        }
        const docArray = VariableUtils.findVariableDocArray(buffer, location.line);
        const doc = new CobolDocParser().parseCobolDoc(docArray);
        const finalArray = doc.comment;
        return this.removeLastEmptyCommentIfNeeded(finalArray);
    }

    /**
     * Returns the array without the last comment if and only if the last comment
     * represents an empty string.
     */
    private removeLastEmptyCommentIfNeeded(comment: string[]): string[] {
        // Removes the last comment in case of being empty
        if (comment.length > 0 && comment[comment.length - 1] === "") {
            const filteredComment = comment.slice(0, comment.length - 1);
            return filteredComment;
        }
        return comment;
    }

}
