import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {BaseAppEntity} from "./BaseAppEntity";
import {Field, Float, ObjectType} from "type-graphql";

@ObjectType()
@Entity("users")
export class User extends BaseAppEntity {

    @Field()
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Field()
    @Column("text", { unique: true })
    email: string;

    @Column()
    password: string;

    @Field()
    @Column()
    firstName: string;

    @Field()
    @Column()
    lastName: string;

    @Field()
    @Column()
    phoneNumber: string;

    @Field()
    @Column()
    address: string;

    @Field(() => Float)
    @Column({ type: "float",default:0 })
    km: number;

    @Column({ default: false })
    isVerify: boolean;

    @Column("int", { default: 0 })
    tokenVersion: number;
}
