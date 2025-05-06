import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm"

@Entity()
export class Setting {

    @PrimaryGeneratedColumn()
    id: string
    
    @Column({ type: "numeric", precision: 10, scale: 3, default: 0 })
    maxTradeSell: number

    @Column({ type: "numeric", precision: 10, scale: 3, default: 0 })
    minTradeSell : number

    @Column({ type: "numeric", precision: 10, scale: 3, default: 0 })
    maxTradeBuy: number

    @Column({ type: "numeric", precision: 10, scale: 3, default: 0 })
    minTradeBuy : number

    @Column({ type: "numeric",default:0})
    maxSellCoin : number

    @Column({ type: "numeric",default:0})
    minSellCoin : number

    @Column({ type: "numeric",default:0})
    maxBuyCoin : number

    @Column({ type: "numeric",default:0})
    minBuyCoin : number

    @Column({ type: "numeric",default:0})
    offerTolerance : number
    @Column({type:"numeric",default:0})
    expireTime:number
     
    @Column({type:"boolean",default:true})
    tradeIsOpen:boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt : Date
        
    @DeleteDateColumn()
    deletedAt : Date
}

// curl --header "Content-Type: application/json" \
//   --request POST \
//   --data '{"maxTradeSell":300,"minTradeSell":1,"maxTradeBuy":300,"minTradeBuy":1,"offerTolerance":1000000,"expireTime":24}' \ http://localhost:7000/setting/update
    