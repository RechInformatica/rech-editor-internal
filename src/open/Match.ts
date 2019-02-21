/**
 * File search match in the buffer
 */
export class Match {

  /* File name */
  public file: string;
  /* Match row */
  public row: number;
  /* Match column */
  public column: number;

  /**
   * Creates a new match
   */
  constructor(file: string, row: number, column: number) {
    this.file = file;
    this.row = row;
    this.column = column;
  }

}