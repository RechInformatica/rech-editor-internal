import * as path from 'path';
import { expect } from 'chai';
import 'mocha';
import { PreprocHeaderDetector } from '../../preproc/PreprocHeaderDetector';

describe('Tests preproc header detection', () => {

    it('Checks file which does not exist', async () => {
        const result = await new PreprocHeaderDetector().checkHeaderExists(path.join(__dirname, 'inexisting-file.cbl'));
        expect(result).to.equal(false);
    });

    it('Checks file with header', async () => {
        const result = await new PreprocHeaderDetector().checkHeaderExists(path.join(__dirname, 'SampleFileWithPreprocHeader.cbl'));
        expect(result).to.equal(true);
    });

    it('Checks file without header', async () => {
        const result = await new PreprocHeaderDetector().checkHeaderExists(path.join(__dirname, 'SampleFileWithoutPreprocHeader.cbl'));
        expect(result).to.equal(false);
    });

});


