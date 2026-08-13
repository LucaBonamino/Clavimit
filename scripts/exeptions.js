export class ClavimitError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}