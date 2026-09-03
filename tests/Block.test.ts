import {deepStrictEqual, throws} from 'assert';
import {Block} from '../src/Block';
import {ReferenceRegistry} from '../src/ReferenceRegistry';

describe('Test block', () => {
    it('Tests condition represent', () => {
        const rawBlock = [
            {
                name: '5451.56.close',
                params: []
            }
        ];
        const block = new Block(rawBlock, new ReferenceRegistry());

        deepStrictEqual(block.represent(), rawBlock);
    });

    it('Should fail on empty block', () => {
        const rawBlock = [];

        throws(() => new Block(rawBlock, new ReferenceRegistry()), Error);
    });
});
