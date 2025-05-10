import { AppDataSource } from "../data-source"
import { Otp } from "../entity/Otp"
import {SmsService} from "./sms.service"
import {SmsNewService} from "./smsnew.service"


export class OtpService{
    private otpRepository  = AppDataSource.getRepository(Otp)
    private smsService = new SmsService()
     
    async sendOtpMessage(phoneNumber: string) {
        try {
            let otp = this.generateOTP(4);
            console.log('find the body' , phoneNumber)
            console.log('code ,' , otp)
            const otpExist = await this.otpRepository.findOne({where : {
                phoneNumber : phoneNumber
            }});
            console.log('otpExisttttttt' , otpExist)
            let res : any = await this.smsService.sendOtpMessage(phoneNumber , otp);                // Await the response          
            if (res.success) {
                if (otpExist) {
                    console.log('otp existtt')
                    otpExist.time = new Date().getTime().toString();
                    otpExist.otp = otp;
                    let saved = await this.otpRepository.save(otpExist);
                    console.log('saved transActions' , saved)
                } else {
                    let createdOtp = this.otpRepository.create({ otp, phoneNumber, time: new Date().getTime().toString()});
                    console.log('created>>>' , createdOtp)
                    let saved =  await this.otpRepository.save(createdOtp);
                    console.log('saved transActions2222' , saved)
                }
                return {status:"ok",msg:res.msg,otp}
                
            } else {
               
                return {status:"nok",msg:res.msg,otp}
            }
        } catch (error) {
            return error
        }
    }

    async checkOtpVerification(phoneNumber:string,otp:string) {
        try {
            const foundUserOtp = await this.otpRepository.findOneByOrFail({ phoneNumber });
            console.log('founded user otp' , foundUserOtp)
            const currentTime = new Date();
            const otpCreationTime = foundUserOtp.time; 
            const otpExpirationTime = new Date(+otpCreationTime + 2 * 60 * 1000); 
            // console.log()
            if (currentTime > otpExpirationTime) {
                // await this.otpRepository.delete({ phoneNumber });
                // return response.status(400).json({ msg: 'کد تایید منقضی شده است ' });
                return {status:"nok",msg:'کد تایید منقضی شده است '}
            }
    
            if (foundUserOtp.otp !== otp) {
                return {status:"nok", msg: 'کد تایید صحیح نیست .لطفا دوباه تلاش کنید.'}
            }
            
           
           
            return {status:"ok", msg: 'با موفقیت وارد شدید'}

    
        } catch (error) {
            return error
        }
    }
    private  generateOTP(limit) {          
        var digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < limit; i++ ) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    }
    
}