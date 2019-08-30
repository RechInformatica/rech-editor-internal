'use babel';
import { Path, GenericExecutor } from 'rech-editor-cobol';
import Q from 'q';

/**
 * Wrapper implementation that stores and fires unliminted number of GenericExecutor implementations
 */
export class ExecutorWrapper implements GenericExecutor {

    /* List of executors */
    private executorList: GenericExecutor[];

    public constructor() {
        this.executorList = [];
    }

    public addExecutor(executor: GenericExecutor) {
        this.executorList.push(executor);
    }

    /**
     * Define the path to validate
     */
    public setPath(path: string | Path): GenericExecutor {
        this.executorList.forEach((executor) => {
            executor.setPath(path);
        });
        return this;
    }

    /**
     * Run decorated executors
     */
    public exec(file?: string) {
        return new Promise<any>((resolve, reject) => {
            let executionPromises:Array<Promise<any>> = new Array;
            this.executorList.forEach((executor) => {
                executionPromises.push(executor.exec(file));
            });
            let allResults = " ";
            Q.allSettled(executionPromises).then((results) => {
                results.forEach((result) => {
                    if (result.state == "fulfilled") {
                        const currentValue = result.value!;
                        allResults = allResults.concat(currentValue);
                    }
                });
                resolve(allResults);
            }).catch(() => {
                reject();
            })
        });
    }
}