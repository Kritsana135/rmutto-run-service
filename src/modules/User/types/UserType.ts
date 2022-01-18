import { Field, InputType } from "type-graphql";
import { Length } from "class-validator";

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @Length(2, 50)
  firstName: string;

  @Field({ nullable: true })
  @Length(2, 50)
  lastName: string;

  @Field({ nullable: true })
  @Length(9, 15)
  phoneNumber: string;

  @Field({ nullable: true })
  address: string;
}
