export interface responseInterface {

}


export interface jwtGeneratorInterfaceAdmin {
    id: number;
   
    phoneNumber:string

    role:string

    isBlocked : boolean

}


export interface jwtGeneratorInterfaceUser {
    id: number;
   
    phoneNumber:string

    isBlocked : boolean

}

export interface responseInterface {

}


export interface monitorInterface {
    scope: string,
    status: number,
    error: string | null,
}


export interface userLoggInterface {
    firstName: string;
    lastName: string;
    phoneNumber: string;
}


export interface adminLoggInterface {
    firstName: string;
    lastName: string;
    phoneNumber: string;
}


export interface trackIdInterface {
    phoneNumber: string,
    firstName?: string,
    lastName?: string,
    trackId: string,
    fatherName?: string,
    status: boolean,
}