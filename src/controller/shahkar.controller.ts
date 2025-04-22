import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import { User } from "../entity/User";
import {ShahkarService} from "../services/shahkar-service"
import { responseModel } from "../utills/response.model";
import {OtpService} from "../services/otp.service"
import {JwtGenerator} from "../services/jwt.service"
import { validationResult } from "express-validator";
import {Wallet} from "../entity/Wallet"
import axios from "axios";
import { internalDB } from "../selfDB/saveDATA.service";
import { error } from "console";


export class ShahkarController {
    private userRepository = AppDataSource.getRepository(User);
    private walletRepository=AppDataSource.getRepository(Wallet);
    private shahkarservice=new ShahkarService()


    async matchPhoneAndNationalCodeAndGetIdentity(req: Request, res: Response, next: NextFunction){
        //  const bodyError = validationResult(req)
        //   if (!bodyError.isEmpty()) {
        //      return next(new responseModel(req, res,bodyError['errors'][0].msg,'shahkar',400,bodyError['errors'][0].msg ,null))
        //   }  
        //   const {nationalCode,birthDate}=req.body  
        //   const queryRunner = AppDataSource.createQueryRunner()
        //   await queryRunner.connect()
        //   await queryRunner.startTransaction()
        //   try{
        //     const isExist=await this.userRepository.findOne({where:{nationalCode}})
        //     if(isExist){
        //       console.log("iss",isExist);
                
        //       const msg = "کاربر قبلا با شماره دیگری در سامانه خانه طلا ثبت نام کرده است"
        //       return next(new responseModel(req, res,msg,'shahkar',403,msg,null))
        //     }
        //     const phone=req.user.phoneNumber
        //     const isMatch=await this.shahkarservice.checkMatchOfPhoneAndNationalCode(phone,nationalCode)
        //     if (isMatch == 'noToken'){
        //       console.log('111')
        //       const msg='سیستم احراز هویت موقتا در دسترس نمیباشد.لطفا دقایقی دیگر مجددا تلاش کنید.' 
        //       return next(new responseModel(req, res,msg,'shahkar', 500,msg,null))
        //   }
  
        //   if (isMatch == 'unknown'){
        //       console.log('222')
        //       const msg='مشکلی در در احراز هویت بوجود آمده است.لطفا دقایقی دیگر مجددا تلاش کنید.' 
        //       return next(new responseModel(req, res,msg,'shahkar', 500,msg,null))
        //   }
        //   if (isMatch == 500){
        //       console.log('333')
        //       const msg='سیستم احراز هویت موقتا در دسترس نمیباشد.لطفا دقایقی دیگر مجددا تلاش کنید.' 
        //       return next(new responseModel(req, res,msg,'shahkar', 500,msg,null))
        //   }
  
        //   if (isMatch == false) {
        //       console.log('444')
        //       const msg='شماره تلفن با شماره ملی مطابقت ندارد'
        //       return next(new responseModel(req, res,msg,'shahkar', 500,msg,null))
        //   }
  
        //   const userInfo=await this.shahkarservice.identityInformationOfUser(phone,birthDate,nationalCode)
        //   if(!userInfo.user){
        //       return next(new responseModel(req, res,userInfo.msg,'shahkar', 500,userInfo.msg,null))
        //   }
        //   const time= new Date().toLocaleString('fa-IR').split(',')[1]
        //   const date= new Date().toLocaleString('fa-IR').split(',')[0]
        //   const newUser=await this.userRepository.findOne({where:{phoneNumber:phone}})
        //   newUser.firstName=userInfo.user.firstName
        //   newUser.lastName=userInfo.user.lastName,
        //   newUser.birthDate=userInfo.user.birthDate,
        //   newUser.fatherName=userInfo.user.fatherName
        //   newUser.time=time,
        //   newUser.date=date,
        //   newUser.gender=userInfo.user.gender,
        //   newUser.identityNumber=userInfo.user.identityNumber
        //   newUser.identitySeri=userInfo.user.identitySeri
        //   newUser.identitySerial=userInfo.user.identitySerial
        //   newUser.identityTraceCode=userInfo.user.identityTraceCode
        //   newUser.liveStatus=userInfo.user.liveStatus
        //   newUser.nationalCode=userInfo.user.nationalCode
        //   newUser.verificationStatus=1
          
  
        //   const newWallet= this.walletRepository.create({
        //     balance:0,
        //     goldWeight:0,
        //     user:newUser
        //   })
  
        //   await queryRunner.manager.save(newUser)
        //   await queryRunner.manager.save(newWallet)
        //   await queryRunner.commitTransaction()
        //   return next(new responseModel(req, res,null,'shahkar', 200,null,newUser))
        //   }catch(err){
        //     console.log("err",error);
        //     await queryRunner.rollbackTransaction()
        //     return next(new responseModel(req, res,"خطای داخلی سیستم",'send otp', 500,"خطای داخلی سیستم",null))
        //   }finally{
        //     console.log('transaction released')
        //     await queryRunner.release()
        //   }
         
 
    }

    async getIdentityWithNationalCode(req: Request, res: Response, next: NextFunction){
        const bodyError = validationResult(req)
        if (!bodyError.isEmpty()) {
           return next(new responseModel(req, res,bodyError['errors'][0].msg,'check identity',400,bodyError['errors'][0].msg ,null))
         }    

    }

   



}