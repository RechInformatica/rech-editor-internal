'use babel';
import Match from './match';

/**
 * File search matcher
 */
export default class Matcher {

  constructor() {
  }

  /**
   * Extracts file paths from the line
   */
  getFilePathsFromLine(line: string) {
    if (line == undefined) {
      return [];
    }
    var result : Match[] = [];
    // Nomralize: Compile output
    line = line.replace(/[,;]?\s*line\s*[=:]\s*(\d+)/i, ":$1");
    // Full filenames in the line
    let matches = line.match(/([A-Z]:)?([^:\s\*\?\"\'\<\>\|]+\.\w+)(:\d+)?/gi);
    if (matches != null) {
      result = result.concat(matches.map((match) => {
        return this.buildMatch(match);
      }));
    }
    // Returns stuff that is between quotes and looks like a file name (import from 'match')
    matches = line.match(/[\'\"]([A-Z]:)?([^:\s\*\?\"\'\<\>\|]+(\.\w+)?(:\d+)?[\'\"])/gi);
    if (matches != null) {
      result = result.concat(matches.map((match) => {
          return this.buildMatch(match.replace(/['\"]/g, ""));
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
    if (match) {
      // Parses the row number
      let row = parseInt(match[2]);
      if (row) {
          row = isNaN(row) ? 1 : row;
          return new Match(match[1], row, 1);
        }
    }
    return new Match(text, 1, 1);
  }

};
