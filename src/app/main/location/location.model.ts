export class StoreLocation {
    constructor(
        public id: string,
        public title: string,
        public street: string,
        public city: string,
        public state: string,
        public zip: string,
        public hours: {},
        public open: boolean,
        public expanded: boolean,
        public storeId: number,
        public phonenumber: string,
        public coordinates: {}
    ) {}
}