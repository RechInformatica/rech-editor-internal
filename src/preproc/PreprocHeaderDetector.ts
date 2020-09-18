import * as readline from 'readline';
import * as fs from 'fs';

/** Max number of lines to look for a COBOL PreProcessor header */
const MAX_LINES_PREPROCESSOR_HEADER = 10;
/** Regular expression to detect whether the header exists */
const HEADER_REGEX = /^\s+\*\>\sCobolPreProcessor/gm;

/**
 * Class to detect whether a file contains or not
 * a preprocessed header.
 */
export class PreprocHeaderDetector {

    /**
     * Returns true whether the specified file has
     * already been preprocessed
     * 
     * @param file file to check whether the preprocessed header exists
     */
    public checkHeaderExists(file: string): Promise<boolean> {
        return new Promise((resolve, _reject) => {

            // Should only read existing files, so when file
            // does not exist we don't need to continue
            if (!fs.existsSync(file)) {
                return resolve(false);
            }

            // Creates instance to read file lines
            const readStream = fs.createReadStream(file);
            const rl = readline.createInterface({ input: readStream });

            // Variables to control whether preprocessor header has been found
            let streamClosed = false;
            let preprocessedSource = false;
            let lineNumber = 0;

            // Callback declaration
            const readCallbackFn = function (line: any): void {
                // Needs extra checking for stream closed because some lines are buffered by readLine library
                // and the buffered lines keep being called even after rl.close() is executed
                if (!streamClosed) {
                    const match = HEADER_REGEX.exec(line);
                    if (match) {
                        preprocessedSource = true;
                        streamClosed = true;
                        rl.close();
                    }
                    if (lineNumber > MAX_LINES_PREPROCESSOR_HEADER) {
                        streamClosed = true;
                        rl.close();
                    }
                    lineNumber++;
                }
            };

            const closeCallbackFn = function (): void {
                readStream.close();
                resolve(preprocessedSource);
            }
            
            // Configure callbacks
            rl.on('line', (line) => readCallbackFn(line));
            rl.on('close', () => closeCallbackFn());
        });
    }

}
