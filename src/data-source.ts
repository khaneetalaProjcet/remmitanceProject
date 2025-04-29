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
import { Fee } from "./entity/Fee"
import { Setting } from "./entity/Setting"
import { AppBankAccount } from "./entity/AppBankAccount"
import { OfferInvoice } from "./entity/OfferInvoice"
import { Prices } from "./entity/Prices"

import {config} from "dotenv"
import { TelegramUser } from "./entity/TelegramUser"

config()

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port:  +process.env.DB_PORT || 5432,
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "qazZAQ!@#",
    database: process.env.DB_NAME || "remmitance",
    synchronize: true,
    logging: false,
    entities: [Prices,TelegramUser,OfferInvoice,AppBankAccount,Setting,Admin,BankAccount,Invoice,InvoiceType,PaymentInfo,User,Otp,Wallet,WalletTransaction,accessPoint,GoldPrice,Fee],
    migrations: [],
    subscribers: [],
})
    