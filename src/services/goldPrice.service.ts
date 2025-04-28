import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import axios from "axios";
import { GoldPrice } from "../entity/GoldPrice";
import { responseModel } from "../utills/response.model";
import cacher from "../services/cacher"
import {Fee} from "../entity/Fee"




export class goldPriceService{
    private goldPriceRepository = AppDataSource.getRepository(GoldPrice);
    private feeRepository=AppDataSource.getRepository(Fee)


     async getGoldPrice(){
        try{
         let lastGoldPrice = await this.goldPriceRepository.find()
         if (lastGoldPrice.length){
             // console.log('lastGold price in database',lastGoldPrice)
             try {
                 let totalPrice : any = await cacher.getter("price")
                 let price = totalPrice.lastPrice;
                 let change = totalPrice.lastChange;
                 console.log( 'what happened for cache . . .', price , change)
                 if (!price && !change) {
                     console.log('cache is empty for gold price ....')
                     let lastIndex = lastGoldPrice.length-1
                     price = +lastGoldPrice[lastIndex]
                     change = 0
                 }
                 let lastIndex = lastGoldPrice.length-2
                 let lastPrice = (+lastGoldPrice[lastIndex])
                 const sellPrice=price.sellPrice
                 const buyPrice=price.buyPrice
                
                  
                 return {sellPrice,buyPrice}
             } catch (error) {
                 let lastIndex = lastGoldPrice.length-1
                 let price = (lastGoldPrice[lastIndex])
                 const sellPrice=price.sellPrice
                 const buyPrice=price.buyPrice
                
                 // console.log("error in get gold price", error);
                 return {price,sellPrice,buyPrice}
             }
         }else{
             // return {price : lastGoldPrice[0].Geram18 , change : 1000}
             const price=lastGoldPrice[0]
             const sellPrice=price.sellPrice
             const buyPrice=price.buyPrice

             return {sellPrice,buyPrice}
         }
        }catch(err){
          
        }
     }

     async getRealPrice(){
        const response=await axios.get('https://khaneetala.ir/api/goldPrice')
        const realGoldPrice=response.data.buyPrice
        return realGoldPrice
     }

    
     

}
