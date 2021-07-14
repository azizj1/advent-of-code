export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    // restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}

export function assert<T>(
  val: T,
  conditionOrMsg?: ((val: T) => boolean) | boolean | string,
  message?: string
): T {
  if (conditionOrMsg === undefined || typeof conditionOrMsg === 'string') {
    if (!val) {
      throw new AssertionError(`AssertionError: ${conditionOrMsg ?? message}`);
    } else {
      return val;
    }
  } else if (
    typeof conditionOrMsg === 'function' &&
    (val == null || !conditionOrMsg(val))
  ) {
    throw new AssertionError(`AssertionError: ${message}`);
  } else if (
    typeof conditionOrMsg === 'boolean' &&
    (val == null || !conditionOrMsg)
  ) {
    throw new AssertionError(`AssertionError: ${message}`);
  }
  return val;
}
