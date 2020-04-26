export class QuoteItem {
    constructor(
        public id: string,
        public itemId: string,
        public createdAt: Date,
        public updatedAt: Date,
        public itemName: string,
        public itemPrice: number,
        public totalItemPrice: number,
        public itemQuantity: number,
        public itemOptions: object,
        public userId: string
    ){}
}