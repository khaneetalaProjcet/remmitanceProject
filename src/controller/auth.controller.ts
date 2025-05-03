import { AppDataSource } from "../data-source";
import { Request, Response,NextFunction } from "express";
import { User } from "../entity/User";
import { Wallet } from "../entity/Wallet";
import { responseModel } from "../utills/response.model";
import {OtpService} from "../services/otp.service"
import {JwtGenerator} from "../services/jwt.service"
import { validationResult } from "express-validator";




export class AuthController {
    private userRepository = AppDataSource.getRepository(User);
    private walletRepository=AppDataSource.getRepository(Wallet)
    private otpService=new OtpService()
    private jwtGenerator=new JwtGenerator()

    /**
     * send otp to app
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
   
    async sendOtpMessage(req: Request, res: Response, next: NextFunction) {
        try{
            const bodyError = validationResult(req)
            if (!bodyError.isEmpty()) {
                return next(new responseModel(req, res,bodyError['errors'][0].msg,'send otp',400,bodyError['errors'][0].msg ,null))
            }   
            const {phone}=req.body
            console.log(phone);
            const result=await this.otpService.sendOtpMessage(phone)
    
            if(result.status=="nok"){
                return next(new responseModel(req, res,result.msg,'send otp',400,result.msg ,null))
            }

            return next(new responseModel(req, res, '','send otp', 200, null,result.otp))
        }catch(err){
            return next(new responseModel(req, res,"خطای داخلی سیستم",'send otp', 500,"خطای داخلی سیستم",null))
        }
    }
    /**
     * login app user 
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    async loginUser (req: Request, res: Response, next: NextFunction){
        const bodyError = validationResult(req)
        if (!bodyError.isEmpty()) {
            return next(new responseModel(req, res,bodyError['errors'][0].msg,'login',400,bodyError['errors'][0].msg ,null))
        }   
        const {phone,otp}=req.body
        try{

         const result=await this.otpService.checkOtpVerification(phone,otp)
         console.log("resulttttt",result);
         
        if(result.status=="nok"){
            return next(new responseModel(req, res,result.msg,'login',400,result.msg ,null))
        }

        const user=await this.userRepository.findOne({where:{phoneNumber:phone}})

        if(!user){  //? user dont exist
            
        const newUser=this.userRepository.create({phoneNumber:phone})
        await this.userRepository.save(newUser) 
        const token=await this.jwtGenerator.tokenizeUserToken({id:user.id,phoneNumber:user.phoneNumber,isBlocked:false})
        const refreshToken=await this.jwtGenerator.tokenizeUserRefreshToken({id:user.id,phoneNumber:user.phoneNumber,isBlocked:false})
        await this.userRepository.save(user)
        return next(new responseModel(req, res,'','login',200,'',{token,refreshToken}))

        }else{ //? user exist 
            console.log(user);
            const token=await this.jwtGenerator.tokenizeUserToken({id:user.id,phoneNumber:user.phoneNumber,isBlocked:false})
            const refreshToken=await this.jwtGenerator.tokenizeUserRefreshToken({id:user.id,phoneNumber:user.phoneNumber,isBlocked:false})
            return next(new responseModel(req, res,'','login',200,'',{token,refreshToken}))
        }
        }catch(err){
            return next(new responseModel(req, res,"خطای داخلی سیستم",'send otp', 500,"خطای داخلی سیستم",null))
        }
    }


    async refreshTokenCheck(req: Request, res: Response, next: NextFunction){
        console.log("userrrrrrrrr",req.user);
        const user = await this.userRepository.findOne({where:{id:req.user.id}})
        if(!user){
            return next(new responseModel(req, res,"کاربر پیدا نشد",'refresh token', 403,"کاربر پیدا نشد",null))
        }
        const token=await this.jwtGenerator.tokenizeUserToken({id:user.id,phoneNumber:user.phoneNumber,isBlocked:false})
        return next(new responseModel(req, res,'','refresh token',200,'',token))
    }


    async logout (req: Request, res: Response, next: NextFunction){
    //     const {refreshToken}=req.body
    //     const user = await this.userRepository.findOne({where:{refreshToken}})
    //     if(!user){
    //         return next(new responseModel(req, res,"کاربر پیدا نشد",'refresh token', 403,"کاربر پیدا نشد",null))
    //     }
        
        return next(new responseModel(req, res,'','refresh token',200,'',null))
    }



    async approveRequest(req: Request, res: Response, next: NextFunction){
        const {firstName,lastName}=req.body
        const newUser=await this.userRepository.findOne({where:{phoneNumber:req.user.phoneNumber}})
        
        if(newUser&&newUser.verificationStatus==2){
            return next(new responseModel(req, res,"کاربر احراز شده است",'refresh token', 403,"کاربر احراز شده است",null))
        }
        if(newUser&&newUser.verificationStatus==1){
            return next(new responseModel(req, res,"کاربر درخواست تایید داده است",'refresh token', 403,"کاربر درخواست تایید داده است",null))
        }
        if(newUser&&newUser.verificationStatus==3){
            newUser.verificationStatus=4
            await this.userRepository.save(newUser)
            return next(new responseModel(req, res,'','approveRequest',200,'',newUser))
        }


        const wallet=this.walletRepository.create({
            goldWeight:0,
            balance:0
        })
        await this.walletRepository.save(wallet)

        newUser.verificationStatus=1
        newUser.firstName=firstName
        newUser.lastName=lastName
        newUser.wallet=wallet


        await this.userRepository.save(newUser)
        

        return next(new responseModel(req, res,'','approveRequest',200,'',newUser))

    }

    
    async getTelegramOtp (req: Request, res: Response, next: NextFunction){
        
         const user=await this.userRepository.findOne({where:{id:req.user.id},relations:["telegram"]})
         
         if(user.telegram){
            return next(new responseModel(req, res,'','get telegram otp',200,'',user.telegram.otp))
         }else{
            return next(new responseModel(req, res,'not found','get telegram otp',403,'notfound',null))
         }
           
    }
    

     


}   