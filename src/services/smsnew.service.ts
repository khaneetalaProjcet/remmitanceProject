import axios from "axios"

export class SmsNewService{
  async sendOtpSMS(phoneNumber:string,otp:number){
    try{
      const userName="t.09121000108"
      const password="k2x4OT'@16i"
  
      const body={
            userName,
            password,
            fromNumber:'',
            toNumbers:phoneNumber,
            messageContent:`کد ورود شما ${otp}`,
            isFlash:false,
  
      }
  
        const response=await axios.post('http://www.payamak.vip/api/v1/RestWebApi/SendBatchSms',body,{headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }})
  
        console.log("status",response.status);
        console.log("data",response.data);
        console.log("response",response);
      
       return response
    }catch(err){
      console.log("err",err);
      return err
       
    }
    
  }


    
}


