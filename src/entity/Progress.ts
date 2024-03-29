import { Column, Entity, ManyToOne } from "typeorm";
import { BaseAppEntity } from "./BaseAppEntity";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
@Entity("progress")
export class Progress extends BaseAppEntity {
  @Field()
  @Column({ type: "float" })
  km: number;

  @Field({ nullable: true })
  @Column({ default: null, nullable: true })
  isApprove: boolean;

  @Field()
  @Column()
  image: string;

  @Field({ nullable: true })
  @Column({ default: null, nullable: true })
  rejectReason: string;

  // relation
  @ManyToOne(() => User, (user) => user.progress)
  user: User;
}
