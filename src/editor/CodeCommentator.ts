import { Editor } from "rech-editor-cobol";

/** Rech comment pattern */
const RECH_COMMENTS = "*>->"
/** Start of code separator line */
const START_OF_CODE_SEPARATOR_LINE = "*>----"
/** Cobol comment pattern */
const COBOL_COMMENTS = "*>"
/** Cobol concat term */
const COBOL_CONCAT_TERM = "&"
/** Cobol conditional compilation term term */
const COBOL_CONDITIONAL_COMPILATION_TERM = "$"
/** Number of spaces at the beginning of the line */
const NUMBER_OF_INITIAL_SPACES = 6
/** Inicial position of commented trim line with concat term*/
const INITIAL_POSITION_COMMENTED_LINE_WITH_CONCAT_TERM = COBOL_COMMENTS.length + COBOL_CONCAT_TERM.length;
/** Regex for commented variable 77, 01 or 78 declaration */
const COMMENTED_VARIABLE_DECLARATION_REGEX = /\*\>\d\d/
/** Regex for commented paragraph declaration */
const COMMENTED_PARAGRAPH_DECLARATION_REGEX = /\*\>[A-Za-z0-9\-]+/

export class CodeCommentator {

  /**
   * Comment or uncomment selected code block
   */
  public static applyInSelectedSource() {
    const editor = new Editor();
    editor.selectWholeLines();
    let codeBlock: string[] = [];
    editor.getSelectionBuffer().forEach((line) => {
      codeBlock = codeBlock.concat(line.split(/\r?\n/));
    });
    if (this.mustComment(codeBlock)) {
      editor.replaceSelection(this.commentBlock(codeBlock).join("\n"));
    } else {
      editor.replaceSelection(this.uncommentBlock(codeBlock).join("\n"));
    }
  }

  /**
   * Returns true if must commet the code block
   *
   * @param codeBlock
   */
  private static mustComment(lines: string[]): boolean {
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (this.isRechCommentsOrBlankLine(line.trim())) {
        continue;
      }
      if (line.trim().startsWith(COBOL_COMMENTS)) {
        return false;
      } else {
        return true;
      }
    }
    return true;
  }

  /**
   * Returns the commented code block
   *
   * @param codeBlock
   */
  private static commentBlock(codeBlock: string[]): string[] {
    const commentedCodeBlock = [];
    for (let index = 0; index < codeBlock.length; index++) {
      const line = codeBlock[index];
      const trimLine = line.trim();
      if (this.isRechCommentsOrBlankLine(trimLine) || trimLine.startsWith(COBOL_COMMENTS)) {
        commentedCodeBlock.push(line);
        continue;
      }
      let commentedLine = "";
      commentedLine = this.addSpacesOnLine(commentedLine, NUMBER_OF_INITIAL_SPACES);
      commentedLine += COBOL_COMMENTS;
      const numberOfInitialSpaces = line.length - trimLine.length - NUMBER_OF_INITIAL_SPACES - COBOL_COMMENTS.length
      commentedLine = this.addSpacesOnLine(commentedLine, numberOfInitialSpaces);
      if (trimLine.startsWith(COBOL_CONCAT_TERM)) {
        commentedLine += COBOL_CONCAT_TERM + trimLine.substr(INITIAL_POSITION_COMMENTED_LINE_WITH_CONCAT_TERM, trimLine.length);
      } else {
        commentedLine += trimLine;
      }
      commentedCodeBlock.push(commentedLine);
    }
    return commentedCodeBlock;
  }

  /**
   * Add spaces at line
   *
   * @param currentLine
   * @param numberOfSpaces
   */
  private static addSpacesOnLine(currentLine: string, numberOfSpaces: number): string {
    let line = currentLine;
    if (numberOfSpaces > 0) {
      for (let i = 0; i < numberOfSpaces; i++) {
        line += " ";
      }
    }
    return line;
  }

  /**
   * Returns the uncommented code block
   *
   * @param codeBlock
   */
  private static uncommentBlock(codeBlock: string[]): string[] {
    const uncommentedCodeBlock = [];
    for (let index = 0; index < codeBlock.length; index++) {
      const line = codeBlock[index];
      const trimLine = line.trim();
      if (this.isRechCommentsOrBlankLine(trimLine) || !trimLine.startsWith(COBOL_COMMENTS)) {
        uncommentedCodeBlock.push(line);
        continue;
      }
      let uncommentedLine = "";
      uncommentedLine = this.addSpacesOnLine(uncommentedLine, NUMBER_OF_INITIAL_SPACES);
      const codeLine = trimLine.substr(COBOL_COMMENTS.length, trimLine.length);
      if (codeLine.startsWith(COBOL_CONCAT_TERM)) {
        uncommentedLine += COBOL_CONCAT_TERM;
        uncommentedLine = this.addSpacesOnLine(uncommentedLine, INITIAL_POSITION_COMMENTED_LINE_WITH_CONCAT_TERM - 1);
        uncommentedLine += codeLine.substr(1, codeLine.length);
      } else if (codeLine.startsWith(COBOL_CONDITIONAL_COMPILATION_TERM)) {
        uncommentedLine += codeLine;
      } else if (this.isCommentedVariableOrParagraphDeclaration(trimLine)) {
        uncommentedLine += " " + codeLine;
      } else {
        uncommentedLine = this.addSpacesOnLine(uncommentedLine, COBOL_COMMENTS.length);
        uncommentedLine += codeLine;
      }
      uncommentedCodeBlock.push(uncommentedLine);
    }
    return uncommentedCodeBlock;
  }

  /**
   * Returns true if is a commented variable or paragraph declaration line
   *
   * @param line
   */
  private static isCommentedVariableOrParagraphDeclaration(line: string): boolean {
    return COMMENTED_VARIABLE_DECLARATION_REGEX.test(line.substr(0, 4)) || COMMENTED_PARAGRAPH_DECLARATION_REGEX.test(line);
  }

  /**
   * Returns true if is a rech comments line ou blank line
   *
   * @param line
   */
  private static isRechCommentsOrBlankLine(line: string): boolean {
    return line.startsWith(RECH_COMMENTS) || line.startsWith(START_OF_CODE_SEPARATOR_LINE) || line == "";
  }

}