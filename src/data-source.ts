import "reflect-metadata"
import { DataSource } from "typeorm"
import {Admin} from "./entity/Admin"
import {BankAccount} from "./entity/BankAccount"
import {Invoice} from "./entity/Invoice"
import {InvoiceType} from "./entity/InvoiceType"
import {PaymentInfo} from "./entity/PaymentInfo"
import {User} from "./entity/User"
import {Otp} from "./entity/Otp"
import {Wallet} from "./entity/Wallet"
import {WalletTransaction} from "./entity/WalletTransaction"
import {accessPoint} from "./entity/accessPoint"
import { GoldPrice } from "./entity/GoldPrice"

import {config} from "dotenv"

config()

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port:  +process.env.DB_PORT || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ,
    synchronize: true,
    logging: false,
    entities: [Admin,BankAccount,Invoice,InvoiceType,PaymentInfo,User,Otp,Wallet,WalletTransaction,accessPoint,GoldPrice],
    migrations: [],
    subscribers: [],
})
    