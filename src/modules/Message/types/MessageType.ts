import { Field, InputType, ObjectType } from "type-graphql";
import { Message } from "../../../entity/Message";
import { User } from "../../../entity/User";

@InputType()
export class SendMessageInput {
  @Field()
  reciverId: string;

  @Field()
  content: string;
}

@ObjectType()
export class InBox {
  @Field(() => User)
  user: User;

  @Field(() => Message, { nullable: true })
  lastMessage?: Message;
}

//     sendMessage_id: 'f675b80c-362c-42dd-8f0a-4c5245282cc5',
//     sendMessage_createdAt: 2022-02-06T12:34:02.059Z
//     sendMessage_content: 'lasssssooood',
//     sendMessage_senderId: '1c5b20bc-ec91-4595-aa20-8b68805916ac',
//     sendMessage_reciverId: 'f869428f-5a7c-4414-9db6-e513ec12a995',
//     reciver_id: 'f869428f-5a7c-4414-9db6-e513ec12a995',
