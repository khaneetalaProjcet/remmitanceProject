import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent, UpdateDateColumn } from "typeorm";
import { Admin } from "./Admin";



@Entity()
@Tree('closure-table')
export class accessPoint {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    englishName: string;

    @Column({type : 'varchar' , nullable : true})
    persianName : string;

    @TreeChildren()
    children: accessPoint[];

    @TreeParent()
    parent: accessPoint;

    @ManyToMany(() => Admin)
    @JoinTable()
    Admin: Admin[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

}