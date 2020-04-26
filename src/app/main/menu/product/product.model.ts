export class Product {
    constructor(
        public id: string,
        public name: string,
        public imageUrl: string,
        public price: number,
        public options: {}
    ) {}
}