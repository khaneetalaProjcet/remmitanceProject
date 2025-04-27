import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import { GoldPrice } from "../entity/GoldPrice";
import { responseModel } from "../utills/response.model";
import {settingService} from "../services/setting.service"
import { goldPriceService } from "../services/goldPrice.service";
import cacher from "../services/cacher"
import {Fee} from "../entity/Fee"
import { authMiddlewareAdmin } from "../middleware/auth";



export class GoldPriceController{
    
    private goldPriceRepository = AppDataSource.getRepository(GoldPrice);
    private goldPriceService=new goldPriceService()
    private feeRepository=AppDataSource.getRepository(Fee)
    private settingService=new settingService()

    async setGoldPrice(req: Request, res: Response, next: NextFunction){
      try{
        const {price,sellFee,buyFee} =req.body
        console.log("req",req.body);  
        const newgoldPrice= this.goldPriceRepository.create({
          Geram18:price
        })
        await this.goldPriceRepository.save(newgoldPrice)
        const fee=await this.feeRepository.find()
        if(fee.length==0){
          const mainFee=this.feeRepository.create({sell:1,buy:0})
          await this.feeRepository.save(mainFee)
          return next(new responseModel(req, res,null,'set fee', 200,null,mainFee))
        }
        const mainFee=fee[0]
        mainFee.buy=buyFee?buyFee:mainFee.buy
        mainFee.sell=sellFee?sellFee:mainFee.sell
        await this.feeRepository.save(mainFee)
        await cacher.setter("price",price)
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
                const fee= await this.getFee()
                const sellPrice=this.estimateFeeInPrice(price,fee.sell)
                const buyPrice=this.estimateFeeInPrice(price,fee.buy)
                const setting=await this.settingService.getSetting()
                const realGoldPrice=await this.goldPriceService.getRealPrice()
                return next(new responseModel(req, res,null,'goldprice', 200,null,{price,sellPrice,buyPrice,sellFee:fee.sell,buyFee:fee.buy,setting,realGoldPrice}))
            } catch (error) {
                let lastIndex = lastGoldPrice.length-1
                let price = (+lastGoldPrice[lastIndex].Geram18)
                const fee= await this.getFee()
                const sellPrice=this.estimateFeeInPrice(price,fee.sell)
                const buyPrice=this.estimateFeeInPrice(price,fee.buy)
                // console.log("error in get gold price", error);
                const setting=await this.settingService.getSetting()
                const realGoldPrice=await this.goldPriceService.getRealPrice()
                return next(new responseModel(req, res,null,'goldprice', 200,null,{price,sellPrice,buyPrice,sellFee:fee.sell,buyFee:fee.buy,setting,realGoldPrice}))
            }
        }else{
            // return {price : lastGoldPrice[0].Geram18 , change : 1000}
            const price=lastGoldPrice[0].Geram18
            const fee= await this.getFee()
            const sellPrice=this.estimateFeeInPrice(price,fee.sell)
            const buyPrice=this.estimateFeeInPrice(price,fee.buy)
            const setting=await this.settingService.getSetting()
            const realGoldPrice=await this.goldPriceService.getRealPrice()
            return next(new responseModel(req, res,null,'goldprice', 200,null,{price,sellPrice,buyPrice,sellFee:fee.sell,buyFee:fee.buy,setting,realGoldPrice} ))
        }
       }catch(err){
        return next(new responseModel(req, res,"خطای داخلی سیستم",'send otp', 500,"خطای داخلی سیستم",null))
       }
    }
    async setFee(req: Request, res: Response, next: NextFunction){
      const {sellFee,buyFee}=req.body
      const fee=await this.feeRepository.find()
      if(fee.length==0){
        const mainFee=this.feeRepository.create({sell:1,buy:0})
        await this.feeRepository.save(mainFee)
        return next(new responseModel(req, res,null,'set fee', 200,null,mainFee))
      }
      const mainFee=fee[0]
      mainFee.buy=buyFee
      mainFee.sell=sellFee
      
      await this.feeRepository.save(mainFee)
      return next(new responseModel(req, res,null,'set fee', 200,null,mainFee))
      
    }
    async getFeeAPI(req: Request, res: Response, next: NextFunction){
     const fee= await this.feeRepository.find()
     if(fee.length==0){
      const mainFee=await this.createDefaultFee()
      return next(new responseModel(req, res,null,'get fee', 200,null,mainFee))
     }
     const mainFee=fee[0] 
     return next(new responseModel(req, res,null,'get fee', 200,null,mainFee))
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