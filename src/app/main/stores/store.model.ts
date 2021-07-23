export class Store {
  constructor(
    public id: number,
    public storeId: number,
    public open: boolean,
    public title: string,
    public street: string,
    public city: string,
    public state: string,
    public zip: number,
    public expanded: boolean,
    public phonenumber: string,
    public hours: {},
    public coordinates: {
      latitude: number;
      longitude: number;
    }
  ){}
}