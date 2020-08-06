export class AccountDetails {
    constructor(
        public userId: string,
        public email: string,
        public firstname: string,
        public lastname: string,
        public defaultStore: string
    ) {}
}