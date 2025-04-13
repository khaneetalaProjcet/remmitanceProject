import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class goldPrice {

    @PrimaryGeneratedColumn()
    id : number;

    @Column({type : 'varchar'})
    Geram18: string

    @Column({nullable : true , default : '' , type : 'varchar'})
    Tamam: string

    @Column({nullable : true , default : '' , type : 'varchar'})
    Nim: string

    @Column({nullable : true , default : '' , type : 'varchar'})
    Rob: string

    @Column({nullable : true , default : '' , type : 'varchar'})
    YekGerami: string

    @Column({nullable : true , default : '' , type : 'varchar'})
    Ons: string

    @Column({nullable : true , default : '' , type : 'varchar'})
    Dolar: string

    @Column({nullable : true , default : '' , type : 'varchar'})
    euro: string

    @Column({nullable : true , default : '' , type : 'varchar'})
    Date: string

    @Column({nullable : true , default : '' , type : 'varchar'})
    Time: string

    @Column({type : 'bigint' , nullable : true})
    createTime : number;

    @CreateDateColumn()
    createdAt : Date;

    @DeleteDateColumn()
    deletedAt : Date

}
