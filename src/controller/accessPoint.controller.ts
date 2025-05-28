import { AppDataSource } from "../data-source";
import e, { Request, Response,NextFunction } from "express";
import { Admin } from "../entity/Admin";
import { responseModel } from "../utills/response.model";
import {settingService} from "../services/setting.service"
import { goldPriceService } from "../services/goldPrice.service";
import { accessPoint } from "../entity/accessPoint";
import cacher from "../services/cacher"
import {Fee} from "../entity/Fee"
import { authMiddlewareAdmin } from "../middleware/auth";



export class accessPointController{
    
    
    private accessPointRepository=AppDataSource.getTreeRepository(accessPoint)
    private adminRepository=AppDataSource.getRepository(Admin)
   
   

    async createParnetAccessPoint(req: Request, res: Response, next: NextFunction){
        const {englishName,persianName}=req.body
      try{
        const accessPoint= this.accessPointRepository.create({englishName,persianName})

        await this.accessPointRepository.save(accessPoint)
       
        return next(new responseModel(req, res,null,'accessPoint', 200,null,accessPoint))
      }catch(err){
        console.log("err",err);
        return next(new responseModel(req, res,"خطای داخلی سیستم",'accessPoint', 500,"خطای داخلی سیستم",null))
      }
    }
    async createChildAccessPoint(req: Request, res: Response, next: NextFunction){
       try{
        const {englishName,persianName,parentId}=req.body

        const parent=await this.accessPointRepository.findOneOrFail({where:{id:parentId}})
        if(!parent){
            return next(new responseModel(req, res,"دسترسی پیدا نشد",'accessPoint', 400,"دسترسی پیدا نشد",null))
        }

        const accessPoint=this.accessPointRepository.create({englishName,persianName,parent})

        await this.accessPointRepository.save(accessPoint)

        return next(new responseModel(req, res,null,'accessPoint', 200,null,accessPoint))
         
       }catch(err){
        return next(new responseModel(req, res,"خطای داخلی سیستم",'accessPoint', 500,"خطای داخلی سیستم",null))
       }
    }
    async getAllAccessPoints(req: Request, res: Response, next: NextFunction){
        try{
            const accessPoints=await this.accessPointRepository.findTrees();
            console.log(accessPoint);
            
            // if(accessPoint.length==0){
            //     await this.initAccessPoints()
            // }
            return next(new responseModel(req, res,null,'accessPoint', 200,null,accessPoints))
        }catch(err){
            return next(new responseModel(req, res,"خطای داخلی سیستم",'accessPoint', 500,"خطای داخلی سیستم",null))
        }
      

    }
    async updateAdminAccessPoint(req: Request, res: Response, next: NextFunction){
      const {adminId,accessPoints}=req.body
      try{
        const accessArray=accessPoints.filter(item=>item.isActive==true)
        const admin=await this.adminRepository.findOneOrFail({where:{id:adminId},relations:{accessPoints:true}})
        if(!admin){
            return next(new responseModel(req, res,"ادمین پیدا نشد",'accessPoint', 400,"ادمین پیدا نشد",null))
        }
        const accessPointArray=[]
        for (let index = 0; index < accessArray.length; index++) {
            const id = accessArray[index];
           const access= await this.accessPointRepository.findOneOrFail({where:{id:id}})
            if(!access){
                continue ;
            }

            accessPointArray.push(access)
            
        }
        admin.accessPoints=accessPointArray
        await this.adminRepository.save(admin)
        return next(new responseModel(req, res,null,'accessPoint', 200,null,admin))
      }
      catch(err){
        console.log("error",err);  
        return next(new responseModel(req, res,"خطای داخلی سیستم",'accessPoint', 500,"خطای داخلی سیستم",null))
      }

      

      
      
    }

    async getAdminAccessPoint(req: Request, res: Response, next: NextFunction){
      const adminId=+req.params.id
      const finalArray=[]
      const accessPointsAdmin=await this.accessPointRepository.find({relations:{Admin:true}})
      for (let index = 0; index < accessPointsAdmin.length; index++) {
        const element = accessPointsAdmin[index];
        let isAccess=false
        const indexadmin=element.Admin.findIndex(item=>item.id==adminId)
        if(indexadmin!==-1){
            isAccess=true
        }

       
        

        const obj={id:element.id,englishName:element.englishName,persianName:element.persianName,isAccess,parent:element.parent}
        finalArray.push(obj)
        
      }
      return next(new responseModel(req, res,null,'accessPoint', 200,null,finalArray))
    }
    
    private async initAccessPoints(){
        
        const accessPoints=await this.accessPointRepository.findTrees();

        for (let index = 0; index < accessPoints.length; index++) {
          const element = accessPoints[index];
          this.accessPointRepository.remove(element)
          
        }

        const accessPointArray=[
            {englishName:"dashbord",persianName:"داشبورد"},
            {englishName:"orders",persianName:"سفارشات"},
            {englishName:"accounting",persianName:"حسابداری"},
            {englishName:"delivery",persianName:"تحویل"},
            {englishName:"admin",persianName:"ادمین"},
            {englishName:"users",persianName:"کاربران"},
            {englishName:"market control",persianName:"کنترل بازار"},
            
        ]

      

        await this.accessPointRepository.save(accessPointArray)
    }




    


    

}