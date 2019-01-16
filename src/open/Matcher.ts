'use babel';
import { Match } from './Match';

/**
 * File search matcher
 */
export class Matcher {

  constructor() {
  }

  /**
   * Extracts file paths from the line using the specified Regular Expression
   */
  getFilePathsFromLine(line: string, regex: RegExp) {
    if (line === undefined) {
      return [];
    }
    var result: Match[] = [];
    // Full filenames in the line
    let matches = regex.exec(line);
    if (matches !== null) {
      result = result.concat(matches.map((match) => {
        return this.buildMatch(match);
      }));
    }
    return result;
  }

  /**
   * Builds a match based on a text
   */
  private buildMatch(text: string) {
    // Regex for obtaining row and column number
    let match = /^((?:.:)?.+?)(?::(\d+))?$/.exec(text)
    if (match && match[2]) {
      // Parses the row number
      let row = parseInt(match[2]);
      if (row) {
        row = isNaN(row) ? 1 : row;
        return new Match(match[1], row, 0);
      }
    }
    match = /((?:.:)?.+?),\sline\s=\s(\d+)(?:.+col\s(\d+))?/.exec(text);
    if (match && match[2]) {
      // Parses the row number
      let row = parseInt(match[2]);
      if (row) {
        let column = parseInt(match[3]);
        if (!column) {
          column = 1;
        }
        row = isNaN(row) ? 1 : row;
        return new Match(match[1], row, column);
      }
    }
    return new Match(text, 1, 1);
  }

};
