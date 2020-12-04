export class Order {
    constructor(
        public id: string,
        public orderId: number,
        public userId: string,
        public createdAt: Date,
        public updatedAt: Date,
        public taxRate: number,
        public taxAmount: number,
        public subTotal: number,
        public grandTotal: number,
        public deliveryMethod: string,
        public prepTime: string
    ){}
}