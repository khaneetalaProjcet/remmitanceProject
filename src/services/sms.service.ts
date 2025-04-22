const  Kavenegar = require('kavenegar')

export class SmsService{
    private api = Kavenegar.KavenegarApi({apikey:process.env.KAVENEGAR_API_KEY});
            sendOtpMessage(phoneNumber, otp) {
                return new Promise((resolve, reject) => {
                    try {
                        let correctStatuses = [1, 2, 4, 5, 10];
                        this.api.VerifyLookup({ token: otp, template: "otp", receptor: phoneNumber }, (res, status) => {
                            console.log('kavenegar ' , res)
                            if (status == 200 && correctStatuses.includes(res[0].status)) {
                                resolve({ success: true, msg: 'کد اعتبارسنجی با موفقیت ارسال شد' });
                            } else {
                                resolve({ success: false, msg: "خطا در ارسال کد تایید" });
                            }
                        });
                    } catch (error) {
                        console.log(error);
                        reject({ success: false, msg: "خطای داخلی سیستم" });
                    }
                });
            }
            async sendGeneralMessage(phoneNumber,template , token , secToken,thirdToken) {
                try {   
                    let correctStatuses = [1,2,4,5,10]
                    this.api.VerifyLookup({ token,token2 : secToken , token3 : thirdToken, template , receptor: phoneNumber ,  },(res,status)=>{
                        console.log("send message status" , status);
                        if (status == 200 && correctStatuses.includes(res[0].status)) {
                            return {success : true , msg :'پیامک ارسال شد'}                 
                        }else{
                            return {success : false ,msg : "خطا در ارسال پیامک"}
                        }
                    });
                } catch (error) {
                    console.log(error);
                    return {success : false ,msg : "خطای داخلی سیستم"}
                }
            }

    
}


