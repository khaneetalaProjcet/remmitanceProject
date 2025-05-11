import axios from "axios"

export class SmsNewService{
  async sendOtpSMS(phoneNumber:string,otp:number){
    try{
    const response=await axios.post('http://130.185.73.93:3004/verify-otp',{
      otp,
      phoneNumber,
},{headers: {
      'Content-Type': 'application/json'
    }})

    console.log("status",response.status);
    console.log("data",response.data);
    console.log("response",response);
  
   if(response.status==200){
    return true
   }else{
    return false
   }
}catch(err){
  console.log("err",err);
  return false
}
    
  }

  


    
}


