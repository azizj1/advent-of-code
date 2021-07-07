export function assert<T>(
  val: T,
  conditionOrMsg?: ((val: T) => boolean) | string,
  message?: string
): T {
  if (conditionOrMsg === undefined || typeof conditionOrMsg === 'string') {
    if (!val) {
      throw new Error(`AssertionError: ${conditionOrMsg ?? message}`);
    } else {
      return val;
    }
  } else if (typeof conditionOrMsg === 'function' && !conditionOrMsg(val)) {
    throw new Error(`AssertionError: ${message}`);
  }
  return val;
}
