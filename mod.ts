export type OnErrorFunctionInput = {
    data?: unknown;
    expect?: string;
};

/**
 * Function to be executed after an error.
 * Takes in the error that caused the try catch to fail and
 * the props associated with the fail.
 */
export type OnErrorFunction = (
    error: unknown,
    input: OnErrorFunctionInput,
) => void;

/**
 * Function to be executed after an error.
 * Takes in the error that caused the try catch to fail and
 * the props associated with the fail.
 */
export type OnErrorAsyncFunction = (
    error: unknown,
    input: OnErrorFunctionInput,
) => Promise<void>;

export interface ResultWrapperOptions {
    onErrorFunction?: OnErrorFunction;
}

export interface AsyncResultWrapperOptions {
    onErrorAsyncFunction?: OnErrorAsyncFunction;
    /**
     * Defaults to `false`.
     */
    shouldAwaitOnErrorFunction?: boolean;
}

/**
 * The `Error` has the `cause` property as the error that caused the
 * try catch to fail
 */
export type WrappedResult<T> = [T, undefined] | [undefined, Error];

export type AsyncResultWrapper = <T>(
    func: () => Promise<T>,
    options: OnErrorFunctionInput,
) => Promise<WrappedResult<T>>;

export type ResultWrapper = <T>(
    func: () => T,
    options: OnErrorFunctionInput,
) => WrappedResult<T>;

export function createResultWrapper(
    { onErrorFunction }: ResultWrapperOptions,
): ResultWrapper {
    function wrap<T>(
        func: () => T,
        options: OnErrorFunctionInput,
    ): WrappedResult<T> {
        try {
            const result = func();
            return [result, undefined];
        } catch (e) {
            const error = new Error(options.expect);
            error.cause = e;
            onErrorFunction?.(e, options);
            return [undefined, error];
        }
    }
    return wrap;
}

export function createAsyncResultWrapper(
    { shouldAwaitOnErrorFunction, onErrorAsyncFunction }:
        AsyncResultWrapperOptions,
): AsyncResultWrapper {
    async function wrapAsync<T>(
        func: () => Promise<T>,
        options: OnErrorFunctionInput,
    ): Promise<WrappedResult<T>> {
        try {
            const result = await func();
            return [result, undefined];
        } catch (e) {
            const error = new Error(options.expect);
            error.cause = e;

            if (shouldAwaitOnErrorFunction) {
                await onErrorAsyncFunction?.(e, options);
            } else {
                onErrorAsyncFunction?.(e, options);
            }

            return [undefined, error];
        }
    }
    return wrapAsync;
}
