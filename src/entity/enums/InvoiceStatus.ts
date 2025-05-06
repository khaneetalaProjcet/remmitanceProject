

export enum InvoiceStatus {
    Nothing=0,
    CreatedByUser = 1,
    AwaitingAdminApproval = 2,
    RejectedByInitialBot = 3,
  
    AdminApprovedWithIBAN = 4,
    AdminRejected = 5,
    UserSubmittedPayment = 6,
   
  
    AccountantApproved = 7,
    AccountantRejected = 8,
  
    PartiallyDelivered = 9,
    FullyDelivered = 10,
  }

