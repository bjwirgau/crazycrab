import { Injectable } from '@angular/core';
import { ProductOption } from './product-options.model';

export interface productOptionData {
  label: string,
  values: [] 
}

@Injectable({
  providedIn: 'root'
})
export class ProductOptionsService {

  private productOptions: ProductOption[] = [];
  private activeOptions: any[] = [];

  constructor() { }

  get options() {
    return this.productOptions;
  }

  /**
   * 
   * @param productOptions
   */
  initProductOptions(productOptions: {}){
    this.productOptions = [];
    let options = Object.entries(productOptions);
    options.forEach(option => {
      this.createOption(option[0], option[1]["label"], option[1]["values"])
    });
    console.log("Initialized Product Options", this.productOptions);
  }

  /**
   * 
   * @param id 
   * @param label 
   * @param values 
   */
  createOption(id: string, label: string, values: []){
    this.productOptions.push(new ProductOption(id, label, values));
  }
  
  getOption(id: string){
    return this.productOptions.find(option => option.id === id);
  }

  addActiveOption(option: ProductOption, index: number){
    this.activeOptions[option.id] = [option.values[index]['price']];
  }

  collectOptionPrices(){
    let price = 0;
    this.productOptions.forEach(option => {
      if (option.id in this.activeOptions){
        price += parseInt(this.activeOptions[option.id]);
      }
    });

    

    return price;
  }

  clearOptions(){
    this.productOptions = [];
  }

}
