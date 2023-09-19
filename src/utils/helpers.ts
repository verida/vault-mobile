/**
 * Wait for an exact amount of milliseconds
 *
 * @param duration wait duration in milliseconds, default to 1000
 * @return Promise
 */
export function wait(duration = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

/**
 * Execute an async function and abort if it takes too much time
 *
 * @param promise the async function
 * @param timeout timeout in milliseconds
 * @return type of return value from the async function or throw an error if aborted
 */
export async function executeWithTimeout<T>(
  promise: Promise<T>,
  timeout: number
): Promise<T | void> {
  return Promise.race([promise, wait(timeout)])
}
