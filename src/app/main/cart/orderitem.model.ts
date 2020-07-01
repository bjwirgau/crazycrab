export class OrderItem {
    constructor(
        public id: string,
        public orderId: number,
        public itemId: string,
        public createdAt: Date,
        public updatedAt: Date,
        public itemName: string,
        public itemPrice: number,
        public totalItemPrice: number,
        public itemQuantity: number,
        public itemOptions: object,
        public userId: string,
        public imageUrl: string
    ){}
}