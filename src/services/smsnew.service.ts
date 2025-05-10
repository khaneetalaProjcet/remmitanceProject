import axios from "axios"

export class SmsNewService{
  async sendOtpSMS(phoneNumber:string,otp:number){
    try{
     
      
        const response=await axios.post('http://ippanel.com/api/select',{
          user:"u09123460671",
          pass:"Faraz@2049270020529643",
          op:"pattern",
          fromNum:"3000505",
          toNum:phoneNumber,
          patternCode:"dmrl65a4g7l7syv",
          inputData:[{otp:otp}]
         
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


