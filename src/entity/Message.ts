import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { BaseAppEntity } from "./BaseAppEntity";
import { User } from "./User";

@ObjectType()
@Entity("messages")
export class Message extends BaseAppEntity {
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.sendMessage)
  sender: User;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.reciveMessage)
  reciver: User;

  @Field()
  @Column()
  content: string;
}
