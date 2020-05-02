export class Quote {
    constructor(
        public id: string,
        public userId: string,
        public createdAt: Date,
        public updatedAt: Date,
        public taxRate: number,
        public taxAmount: number,
        public subTotal: number,
        public grandTotal: number,
        // public quoteItems: string[],
        // public deliveryMethod: string,
    ){}
}