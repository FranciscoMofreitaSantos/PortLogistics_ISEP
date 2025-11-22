
export type Nationality = string;

export type Status = "activated" | "deactivated"

export interface sar {
    id : string
    name :string
    citizenId :CitizenId
    nationality :Nationality
    email  :Email
    phoneNumber  :PhoneNumber
    sao  : string
    notifs : VvnCode[]
    status  : Status
}

export interface CitizenId{
    passportNumber :string
}

export interface Email{
    address : string
}

export interface PhoneNumber{
    number : string
}


export interface VvnCode{
    code : string
    sequenceNumber : number
    yearNumber: number
}

export interface CreateSARRequest {
    name : string;
    citizenId : CitizenId;
    nationality : Nationality;
    email : Email;
    phoneNumber : PhoneNumber;
    Sao : string; 
    status : string;
}

export interface UpdateSARRequest {
    email : Email;
    phoneNumber : PhoneNumber;
    status : Status;
}

