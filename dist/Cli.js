import { basename } from 'node:path';
import { MockServer } from './index.js';
export class MockServerCli {
    static startMockServer() {
        const ms = new MockServer(basename(process.cwd()));
        ms.run();
    }
}
