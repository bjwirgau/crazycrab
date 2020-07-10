export class Seafood {
    constructor(
        public id: string,
        public name: string,
        public imageUrl: string,
        public price: string
    ) {}
}

export class CustomizedSeafood {
    constructor(
        public id: string,
        public name: string,
        public flavor: string,
        public spicyLevel: string,
        public weight: string,
        public price: string,
        public subtotal: string,
        public imageUrl: string
    ) {}
}