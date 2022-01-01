export class AssertionError extends Error {
  constructor(message?: string) {
    super(message);
    // restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}

export function assert<T>(
  val: T,
  conditionOrMsg?: ((val: NonNullable<T>) => boolean) | boolean | string,
  message?: string
): NonNullable<T> {
  if (conditionOrMsg === undefined || typeof conditionOrMsg === 'string') {
    if (!val) {
      throw new AssertionError(conditionOrMsg || message);
    } else {
      return val!;
    }
  } else if (
    typeof conditionOrMsg === 'function' &&
    (val == null || !conditionOrMsg(val!))
  ) {
    // print either the explicit message, or the condition function.
    throw new AssertionError(message || conditionOrMsg.toString());
  } else if (
    typeof conditionOrMsg === 'boolean' &&
    (val == null || !conditionOrMsg)
  ) {
    throw new AssertionError(message);
  }
  return val!;
}
