import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { User } from "./User";



@Entity()
export class TelegramUser {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.telegram, { onDelete: "CASCADE" ,nullable:true})
    @JoinColumn()
    user: User;

    @Column({type:"bigint",nullable:true})
    chatId: number;

    @Column({ type: "varchar" , default:"awaiting_phone"})
    authState:string

    @Column({ type: "varchar" , nullable:true})
    state: string;
   
    @Column({nullable:true , type:"varchar"})
    otp: string
    
    @CreateDateColumn()
    createdAt : Date;

    @UpdateDateColumn()
    updatedAt : Date
    
    @DeleteDateColumn()
    deletedAt : Date

}

