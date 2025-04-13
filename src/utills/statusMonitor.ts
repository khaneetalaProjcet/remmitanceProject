import { monitorInterface } from "../interface/interfaces.interface";

class interceptor{
    requestCount : number
    status : {failed : number , success : number , internalIssues : number}  
    error : string[]
    constructor(){
        this.requestCount = 0;
        this.status = {failed : 0 , success : 0 , internalIssues : 0}
        this.error = []
    }
    addStatus(info : monitorInterface) : boolean{
        this.requestCount++;
        if (info.status == 0){
            this.status.failed++; 
        }
        if (info.status == 1){
            this.status.success++;
        }
        if(info.status == 2){
            this.status.internalIssues++
        }
        (info.error) ? this.error.push(info.error) : console.log('')
        return true
    }

    async getter(){
        return {
            all : this.requestCount,
            statusCount : this.status,
            error : this.error
        }
    }

}

let monitor = new interceptor()


export default monitor;