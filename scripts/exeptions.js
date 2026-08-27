// Defines ClavimitError, the application-level error type used
// throughout the extension for expected failure cases (invalid keys,
// malformed messages, Gmail integration failures, etc.). Thrown by
// cryptography.js, emailParser.js, and messageFormat.js, and caught
// in content.js to display user-facing error messages.

export class ClavimitError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
