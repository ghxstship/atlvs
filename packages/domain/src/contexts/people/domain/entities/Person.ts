import { AggregateRoot, Identifier } from '../../../../shared/kernel';

export interface PersonProps {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  status: 'active' | 'inactive';
}

export class Person extends AggregateRoot<PersonProps> {
  private constructor(id: Identifier, props: PersonProps) {
    super(id);
    Object.assign(this, { props });
  }

  public static create(props: PersonProps, id?: Identifier): Person {
    return new Person(id || Identifier.create(), props);
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }
}
