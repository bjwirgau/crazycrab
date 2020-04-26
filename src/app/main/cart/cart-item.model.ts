export class CartItem {
    constructor(
        public id: string,
        public name: string,
        public quantity: number,
        public options: [],
        public price: number,
        public imageUrl: string
    ) {}
}