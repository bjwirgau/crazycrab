export class StoreLocation {
    constructor(
        public id: string,
        public title: string,
        public street: string,
        public city: string,
        public state: string,
        public zip: string,
        public hours: {},
        public open: boolean
    ) {}
}