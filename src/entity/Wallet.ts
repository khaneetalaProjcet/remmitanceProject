import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { User } from "./User";
import { WalletTransaction } from "./WalletTransaction";
import { CoinWallet } from "./CoinWallet";


@Entity()
export class Wallet {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.wallet, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User;

    @Column({ type: "numeric", precision: 10, scale: 3, default: 0 })
    goldWeight: number;

    @Column({ type: "int" , nullable : true })
    goldBlock: number;
    
    @Column({ type: "numeric", precision: 15, scale: 0, default: 0 })
    balance: number;
    
    @OneToMany(()=> CoinWallet ,(coin) => coin.wallet)
    coins : CoinWallet[]
    
    
    @Column({type : 'int' , nullable : true , default : 0 })
    blocked : number 

    @OneToMany(()=> WalletTransaction , (wt)=> wt.wallet)
    transactions: WalletTransaction[];

    @CreateDateColumn()
    createdAt : Date;

    @UpdateDateColumn()
    updatedAt : Date
    
    @DeleteDateColumn()
    deletedAt : Date

}

