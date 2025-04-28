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
        const {sellPrice,buyPrice} =req.body
        console.log("req",req.body);  
        const newgoldPrice= this.goldPriceRepository.create({
          sellPrice,
          buyPrice
        })
        await this.goldPriceRepository.save(newgoldPrice)
        await cacher.setter("price",{sellPrice,buyPrice})
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
                let prices : any = await cacher.getter("price")
                const sellPrice=prices.sellPrice
                const buyPrice=prices.buyPrice
                const setting=await this.settingService.getSetting()
                const realGoldPrice=await this.goldPriceService.getRealPrice()
                return next(new responseModel(req, res,null,'goldprice', 200,null,{sellPrice,buyPrice,setting,realGoldPrice}))
            } catch (error) {
                let lastIndex = lastGoldPrice.length-1
                let prices = lastGoldPrice[lastIndex]
                const sellPrice=prices.sellPrice
                const buyPrice=prices.buyPrice
                // console.log("error in get gold price", error);
                const setting=await this.settingService.getSetting()
                const realGoldPrice=await this.goldPriceService.getRealPrice()
                return next(new responseModel(req, res,null,'goldprice', 200,null,{sellPrice,buyPrice,setting,realGoldPrice}))
            }
        }else{
            // return {price : lastGoldPrice[0].Geram18 , change : 1000}
            const prices=lastGoldPrice[0]
            
            const sellPrice=prices.sellPrice
            const buyPrice=prices.buyPrice
            const setting=await this.settingService.getSetting()
            const realGoldPrice=await this.goldPriceService.getRealPrice()
            return next(new responseModel(req, res,null,'goldprice', 200,null,{sellPrice,buyPrice,setting,realGoldPrice} ))
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


    

}