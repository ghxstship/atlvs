export type UUID = string;

export class UniqueEntityID {
  private readonly _value: UUID;
  constructor(value: UUID) {
    if (!value || typeof value !== 'string') {
      throw new Error('UniqueEntityID requires a string UUID');
    }
    this._value = value;
  }
  toString(): string {
    return this._value;
  }
  equals(other?: UniqueEntityID): boolean {
    if (!other) return false;
    return this._value === other._value;
  }
}

// Alias for backward compatibility
export { UniqueEntityID as Identifier };
