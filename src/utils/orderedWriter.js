export class OrderedWriter {
    constructor(writable) {
        this.writable = writable; // This is the fileHandle writable system
        this.expected = 0;
        this.buffers = new Map();
    }

    async add(index, stream) {
        this.buffers.set(index, stream);
        await this.flush();
    }

    async flush() {
        while (this.buffers.has(this.expected)) {
            const stream = this.buffers.get(this.expected);
            this.buffers.delete(this.expected);

            // Pipe the network stream directly into the SSD file writer.
            // preventClose: true stops the file from closing until all parts are done.
            await stream.pipeTo(this.writable, { preventClose: true });

            this.expected++;
        }
    }
}