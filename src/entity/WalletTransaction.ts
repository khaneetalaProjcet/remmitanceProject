import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn ,DeleteDateColumn ,UpdateDateColumn } from "typeorm";
import { Wallet } from "./Wallet";

@Entity()
export class WalletTransaction{
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    type : string

    @Column()
    description :string

    @ManyToOne(()=> Wallet , (wallet)=> wallet.transactions)
    @JoinColumn()
    wallet : Wallet

    @Column({ type: "numeric", precision: 10, scale: 0 ,default : 0 })
    amount : number

    @Column()
    status : string
    
    @Column({nullable : true})
    authority : string

    @Column({nullable : true})
    withdrawalId : string

    @Column({nullable : true})
    invoiceId : string

    @Column({nullable : true})
    time : string

    @Column({nullable : true})
    date : string

    @CreateDateColumn()
    createDate : Date

    @UpdateDateColumn()
    updatedAt : Date

    @DeleteDateColumn()
    deletedAt : Date
}