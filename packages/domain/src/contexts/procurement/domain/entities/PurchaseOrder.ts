import { AggregateRoot, Identifier } from '../../../../shared/kernel';

export interface PurchaseOrderProps {
  organizationId: string;
  vendorId: string;
  orderNumber: string;
  amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'received';
  items: any[];
}

export class PurchaseOrder extends AggregateRoot<PurchaseOrderProps> {
  private constructor(id: Identifier, props: PurchaseOrderProps) {
    super(id);
    Object.assign(this, { props });
  }

  public static create(props: PurchaseOrderProps, id?: Identifier): PurchaseOrder {
    return new PurchaseOrder(id || Identifier.create(), props);
  }
}
