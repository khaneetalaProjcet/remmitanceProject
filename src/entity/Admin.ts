import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, JoinColumn, JoinTable, ManyToMany } from "typeorm"
import { accessPoint } from "./accessPoint";





@Entity()
export class Admin {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type : 'varchar' , nullable : false})
    firstName: string;

    @Column({type : 'varchar' , nullable : false})
    lastName: string;

    @Column({type : 'varchar' , nullable : false})
    phoneNumber: string;


    @Column({type : 'varchar' , nullable : false})
    password : string;

    @Column({type : 'int' , default : 0})
    role : number                                    // 0 : admin  // 1 : super admin 

    @Column({type : 'boolean' , default : false})
    isBlocked : boolean

    @ManyToMany(()=>accessPoint )
    @JoinTable()
    accessPoints : accessPoint[];

    @CreateDateColumn()
    createdAt : Date;

    @UpdateDateColumn()
    updatedAt : Date;

    @DeleteDateColumn()
    deletedAt : Date;

}



