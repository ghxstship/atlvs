import { AggregateRoot, Identifier } from '../../../../shared/kernel';

export interface BudgetProps {
  organizationId: string;
  name: string;
  amount: number;
  currency: string;
  period: string;
  status: 'draft' | 'active' | 'closed';
}

export class Budget extends AggregateRoot<BudgetProps> {
  private constructor(id: Identifier, props: BudgetProps) {
    super(id);
    Object.assign(this, { props });
  }

  public static create(props: BudgetProps, id?: Identifier): Budget {
    return new Budget(id || Identifier.create(), props);
  }
}
