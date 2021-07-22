export class Order {
    constructor(
        public id: string,
        public orderId: number,
        public userId: string,
        public firstname: string,
        public lastname: string,
        public status: string,
        public createdAt: number,
        public updatedAt: number,
        public taxRate: number,
        public taxAmount: number,
        public subTotal: number,
        public grandTotal: number,
        public deliveryMethod: string,
        public prepTime: string
    ){}
}