export class Result<T, E = Error> {
  private constructor(
    public readonly ok: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(true, value);
  }

  static err<E>(error: E): Result<never, E> {
    return new Result<never, E>(false, undefined, error);
  }

  get value(): T {
    if (!this.ok || this._value === undefined) {
      throw new Error('Cannot get the value of an error result');
    }
    return this._value as T;
  }

  get error(): E {
    if (this.ok || this._error === undefined) {
      throw new Error('Cannot get the error of a successful result');
    }
    return this._error as E;
  }
}
