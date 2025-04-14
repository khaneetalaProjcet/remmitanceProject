import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
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
                     price = +lastGoldPrice[lastIndex].Geram18
                     change = 0
                 }
                 let lastIndex = lastGoldPrice.length-2
                 let lastPrice = (+lastGoldPrice[lastIndex].Geram18)
                 let firstChange = ((price - lastPrice)/lastPrice)*100
                 change = (firstChange < 0.1) ? 0 : (firstChange).toFixed(1)
                 const fee= await this.getFee()
                 const sellPrice=this.estimateFeeInPrice(price,fee.sell)
                 const buyPrice=this.estimateFeeInPrice(price,fee.buy)
                  
                 return {price,sellPrice,buyPrice,sellFee:fee.sell,buyFee:fee.buy}
             } catch (error) {
                 let lastIndex = lastGoldPrice.length-1
                 let price = (+lastGoldPrice[lastIndex].Geram18)
                 const fee= await this.getFee()
                 const sellPrice=this.estimateFeeInPrice(price,fee.sell)
                 const buyPrice=this.estimateFeeInPrice(price,fee.buy)
                 // console.log("error in get gold price", error);
                 return {price,sellPrice,buyPrice,sellFee:fee.sell,buyFee:fee.buy}
             }
         }else{
             // return {price : lastGoldPrice[0].Geram18 , change : 1000}
             const price=lastGoldPrice[0].Geram18
             const fee= await this.getFee()
             const sellPrice=this.estimateFeeInPrice(price,fee.sell)
             const buyPrice=this.estimateFeeInPrice(price,fee.buy)
             return {price,sellPrice,buyPrice,sellFee:fee.sell,buyFee:fee.buy}
         }
        }catch(err){
          
        }
     }

     private async createDefaultFee(){
        const fee= this.feeRepository.create({
          sell:1,
          buy:0
        })
        return await this.feeRepository.save(fee)
      }
      private async getFee(){
        const fee= await this.feeRepository.find()
       if(fee.length==0){
        const mainFee=await this.createDefaultFee()
        return mainFee
       }
       const mainFee=fee[0] 
       return mainFee
      }
      private  estimateFeeInPrice(price:any , fee: number){
        const feePrice=+price*fee/100
        const finalPrice=+price+feePrice
        return finalPrice 
      }

}
