export class Quote {
    constructor(
        public id: string,
        public userId: string,
        public createdAt: Date,
        public updatedAt: Date
        // public quoteItems: string[],
        // public subTotal: number,
        // public grandTotal: number,

        // public taxRate: number,
        // public taxAmount: number,
        // public deliveryMethod: string,
    ){}
}