import axios from "axios"
import {internalDB} from "../selfDB/saveDATA.service"
import {trackIdInterface} from "../interface/interfaces.interface"
import monitor from "../utills/statusMonitor"

export class ShahkarService {
    



    async checkMatchOfPhoneAndNationalCode(phoneNumber: string , nationalCode:string ) {
        let checkMatchationUrl = process.env.SHAHKAR_BASE_URL + '/istelamshahkar'
        console.log("check",checkMatchationUrl);
        
        let isMatch = false
        let token = await this.getToken()
        if (token == null || token == undefined) {
            console.log('token is not defined....')
            return 'noToken'
        }
        try {
            let res = await axios.post(checkMatchationUrl, {
                mobileNumber: phoneNumber
                , nationalCode
            }, { headers: { 'Authorization': token } })

            isMatch = res.data.isMatched ? true : false

            if (isMatch) {
                let trackIdData: trackIdInterface = {
                    trackId: res.headers['track-code'],
                    // firstName : firstName,
                    // lastName : lastName,
                    // fatherName : fatherName,
                    phoneNumber: phoneNumber,
                    status: true
                }
                let trackIdService = new internalDB()
                let DBStatus = await trackIdService.saveData(trackIdData)
                // console.log('returned db status>>>>', DBStatus)
                return isMatch
            } else {
                let trackIdData: trackIdInterface = {
                    trackId: res.headers['track-code'],
                    // firstName : firstName,
                    // lastName : lastName,
                    // fatherName : fatherName,
                    phoneNumber: phoneNumber,
                    status: false
                }
                let trackIdService = new internalDB()
                let DBStatus = await trackIdService.saveData(trackIdData)
                // console.log('returned db status>>>>', DBStatus)
                return isMatch
            }
        } catch (error) {
            monitor.error.push(`error in check phone and national code of userssss ` + error.response.data.message)
            console.log('error>>>>>', error)
            if (error.response.headers['track-code']) {
                let trackIdData: trackIdInterface = {
                    trackId: error.response.headers['track-code'],
                    // firstName : firstName,
                    // lastName : lastName,
                    // fatherName : fatherName,
                    phoneNumber: phoneNumber,
                    status: false
                }
                let trackIdService = new internalDB()
                let DBStatus = await trackIdService.saveData(trackIdData)
                // console.log('data base saver result>>>', DBStatus)
                if (+error.response.status >= 500) {
                    return 500
                }
            }
            // console.log('error in ismatch national code', ${error})
            return 'unknown'
        }
    }

     async identityInformationOfUser(phoneNumber : string ,birthDate : string ,nationalCode : string){
        let identityInfoUrl = process.env.IDENTITY_INFO_URL 
        let shahkarToken = await this.getToken()
        if (shahkarToken == null || shahkarToken == undefined) {
            return null
        }else{
        let body = {birthDate : birthDate , nationalCode : nationalCode}   
        try {
           let res = await axios.post(identityInfoUrl , body , {headers : { 'Authorization' : shahkarToken }})
            let info  = res.data 
            console.log('trach code . . .',res.headers['track-code'])
            console.log('shahkar info>>>>' , res)
            if(res.status == 200){
                if (!res.data || res.data == '') {
                    let trackIdData: trackIdInterface = {
                        trackId: res.headers['track-code'],
                        firstName: '',
                        lastName: '',
                        fatherName: '',
                        phoneNumber: '',
                        status: false
                    }
                    let trackIdService = new internalDB()
                    let DBStatus = await trackIdService.saveData(trackIdData)
                    return {user:null, msg: 'کاربر گرامی موقتا سیستم احراز هویت ثبت احوال در دسترس نمیباشد.لطفا دقایقی دیگر مجددا تلاش کنید'}
                }
                let  {
                    firstName,
                    lastName,
                    gender,
                    liveStatus,
                    identificationNo,
                    fatherName,
                    identificationSerial,
                    identificationSeri,
                    officeName,
                  } = info
                let user = {
                    fatherName,
                    gender:(gender == 0) ? false : true
                    ,officeName,
                    birthDate,
                    identityNumber : identificationNo,
                    identitySeri : identificationSeri,
                    identitySerial: identificationSerial,
                    firstName,
                    lastName,
                    phoneNumber,
                    nationalCode,
                    liveStatus,
                    identityTraceCode : res.headers['track-code'],
                }
                const trackObj : trackIdInterface = {
                    phoneNumber:user.phoneNumber,
                    trackId:user.identityTraceCode,
                    fatherName:user.fatherName,
                    firstName:user.fatherName,
                    lastName:user.lastName,
                    status:true
                }
                let saveData=new internalDB()
                const DBStatus=await saveData.saveData(trackObj)
                console.log('returned db status>>>>' , DBStatus)
                return  {user:user,msg:""}

            }else {
                const trackObj : trackIdInterface = {
                    phoneNumber:phoneNumber,
                    trackId:res.headers['track-code'],
                    status:false
                }
                let saveData=new internalDB()
                await saveData.saveData(trackObj)
                const DBStatus=await saveData.saveData(trackObj)
                console.log('returned db status>>>>' , DBStatus)
                return {user:null, msg: 'کاربر گرامی موقتا سیستم احراز هویت ثبت احوال در دسترس نمیباشد.لطفا دقایقی دیگر مجددا تلاش کنید'}          
            }
        } catch (error) {
            console.log(error);
            return   {user:null,msg:"خطای داخلی سیستم"}
        }     
        }
    }

    async checkMatchPhoneNumberAndCartNumber(info){
        try {
            const username = 'khanetala_pigsb'; 
            const password = 'Ttb@78f7hLR'; 
            
            const credentials = `${username}:${password}`;
            const base64Credentials = Buffer.from(credentials).toString('base64');   
            const authHeader = `Basic ${base64Credentials}`;
            const url = 'https://op2.pgsb.ir/NoavaranSP4/CardBirthDate';
            const headers = {
                'Accept-Language': 'fa',
                'CLIENT-DEVICE-ID': '',
                'CLIENT-IP-ADDRESS': '',
                'CLIENT-USER-AGENT': 'User Agent',
                'CLIENT-USER-ID': '09120000000',
                'CLIENT-PLATFORM-TYPE': 'WEB',
                'Content-Type': 'application/json',
                'Cookie': 'cookiesession1=678B2889F7A5EFE5780B165D4D6783F0;',
                'Authorization': authHeader 
            };
            
            const data = {
                card_number: info.cardNumber,
                national_code: info.nationalCode,
                birth_date: info.birthDate
            };
            let response = await axios.post(url, data, { headers }) 
              if(response.status == 200){
                if (response.data) {
                    return response.data.match
                }
              }  else{
                return false
              }
        } catch (error) {
            console.log("error in checkMatchPhoneNumberAndCartNumber" , error);
            return false
        }
    }
    async convertCardToSheba(cardNumber){
        try {
            let body = {
                cardNumber
            }
            let url = "https://drapi.ir/rest/api/main/convertCardToSheba/v1.0/convertcardtosheba"
            let shahkarToken = await this.getToken()
            let res = await axios.post(url,body, {headers : { 'Authorization' : shahkarToken }})
            console.log("ressssssssss",res);
            if(res.status == 200){
                return res.data
            }else{
                return null
            }
        } catch (error) {
            console.log('error in convert to sheba' , error.message);
            return null
        }
    }

    private async getToken(){
        let authUrl = process.env.AUTH_URL
        try {
            let res =  await axios.post(authUrl,{username: "TLS_khanetalla",password: "1M@k8|H43O9S"})
            let token = `Bearer ${res.data.access_token}`
            return token
            
        } catch (error) {
            console.log("error in getToken ShahkarController   " + error);
            return null
        }
    } 
}