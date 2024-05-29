const GENERIC_ERROR_MESSAGES = {
  SERVER_ERROR:
    'An unexpected error occurred on the server. Please try again later.',
  UNAUTHORIZED_ACCESS:
    'You are not authorized to access this resource. Please log in.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
};

const GENERIC_ERROR_CODE_MESSAGES = {
  500: GENERIC_ERROR_MESSAGES.SERVER_ERROR,
  401: GENERIC_ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
  404: GENERIC_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
};

const DEFAULT_ERROR_MESSAGE = 'An unknown error occurred.';

export default class CustomError extends Error {
  /**
   * @param {string} message Error message.
   * @param {string} type Error type.
   */
  constructor(message, type) {
    super(message);
    this.type = type;
    this.customMessage =
      GENERIC_ERROR_MESSAGES[type] ||
      GENERIC_ERROR_CODE_MESSAGES[type] ||
      type ||
      DEFAULT_ERROR_MESSAGE;
  }
}
