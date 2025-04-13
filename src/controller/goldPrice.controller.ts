import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import { GoldPrice } from "../entity/GoldPrice";
import { responseModel } from "../utills/response.model";
import cacher from "../services/cacher"
import { error } from "console";



export class GoldPriceController{
    
    private goldPriceRepository = AppDataSource.getRepository(GoldPrice);

    async setGoldPrice(req: Request, res: Response, next: NextFunction){
      try{
        const {goldPrice} =req.body
        const newgoldPrice= this.goldPriceRepository.create({
          Geram18:goldPrice
        })
        await this.goldPriceRepository.save(newgoldPrice)
        await cacher.setter("price",goldPrice)
        return next(new responseModel(req, res,null,'shahkar', 200,null,newgoldPrice))
      }catch(err){
        console.log("err",err);
        
        return next(new responseModel(req, res,"خطای داخلی سیستم",'send otp', 500,"خطای داخلی سیستم",null))
      }
    }
    async getGoldPrice(req: Request, res: Response, next: NextFunction){
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
                return next(new responseModel(req, res,null,'goldprice', 200,null,{price}))
            } catch (error) {
                let lastIndex = lastGoldPrice.length-1
                let price = (+lastGoldPrice[lastIndex].Geram18)
                
                // console.log("error in get gold price", error);
                return next(new responseModel(req, res,null,'goldprice', 200,null,{price}))
            }
        }else{
            // return {price : lastGoldPrice[0].Geram18 , change : 1000}
            return next(new responseModel(req, res,null,'goldprice', 200,null,{price:lastGoldPrice[0].Geram18} ))
        }
       }catch(err){
        return next(new responseModel(req, res,"خطای داخلی سیستم",'send otp', 500,"خطای داخلی سیستم",null))
       }
    }

}