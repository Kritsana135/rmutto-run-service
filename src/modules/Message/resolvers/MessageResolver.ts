import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getManager, getRepository, Not } from "typeorm";
import { Message } from "../../../entity/Message";
import { User, UserRole } from "../../../entity/User";
import { CustomContext } from "../../../global/interface";
import { isRunner } from "../../middleware/auth/runnerAuth";
import { InBox, SendMessageInput } from "../types/MessageType";

@Resolver()
export class MessageResolver {
  @Mutation(() => Message)
  @UseMiddleware(isRunner)
  async sendMessage(
    @Arg("input") input: SendMessageInput,
    @Ctx() { payload }: CustomContext
  ): Promise<Message> {
    const senderId = payload?.userId!;
    let { reciverId } = input;

    if (reciverId === UserRole.ADMIN) {
      const admin = await User.findOne({ where: { userType: UserRole.ADMIN } });
      if (!admin) {
        throw new Error("admin not found!");
      }
      reciverId = admin?.id;
    }

    const sender = await User.findOne({ id: senderId });
    if (!sender) {
      throw new Error("Not found sender user!");
    }
    const reciver = await User.findOne({ id: reciverId });
    if (!reciver) {
      throw new Error("Not found reciver user!");
    }

    const newMessage = new Message();
    newMessage.content = input.content;
    newMessage.reciver = reciver;
    newMessage.sender = sender;

    const savedMessage = await getManager()
      .getRepository(Message)
      .save(newMessage);
    console.log(savedMessage);
    return savedMessage;
  }

  @Query(() => [User])
  @UseMiddleware(isRunner)
  async getListOfUser(
    @Arg("name", { nullable: true }) name: String,
    @Ctx() { payload }: CustomContext
  ): Promise<User[]> {
    console.log(name);
    const myId = payload?.userId!;
    const myType = await User.findOne({
      select: ["userType"],
      where: { id: myId },
    });
    if (!myType) {
      throw new Error("not found user!");
    }
    let userList: User[] = [];
    if (myType.userType === UserRole.ADMIN) {
      userList = await getRepository(User)
        .createQueryBuilder("user")
        .where("LOWER(user.firstName) like LOWER(:name)", {
          name: `%${name || ""}%`,
        })
        .andWhere("user.userType =:type", { type: UserRole.RUNNER })
        .limit(10)
        .getMany();
    } else {
      userList = await getRepository(User)
        .createQueryBuilder("user")
        .where("user.userType =:type", { type: UserRole.ADMIN })
        .limit(10)
        .getMany();
    }

    return userList;
  }

  @Query(() => [InBox])
  @UseMiddleware(isRunner)
  async inbox(@Ctx() { payload }: CustomContext): Promise<InBox[]> {
    const myId = payload?.userId!;

    const myType = await User.findOne({
      select: ["userType"],
      where: { id: myId },
    });
    if (!myType) {
      throw new Error("not found user!");
    }
    let allUserExceptMe;
    if (myType.userType === UserRole.ADMIN) {
      allUserExceptMe = await User.find({
        where: { id: Not(myId), isVerify: true },
      });
    } else {
      allUserExceptMe = await User.find({
        where: { id: Not(myId), userType: UserRole.ADMIN, isVerify: true },
      });
    }

    const allUserMessage = await Message.find({
      relations: ["sender", "reciver"],
      where: [{ sender: myId }, { reciver: myId }],
      order: {
        createdAt: "DESC",
      },
    });

    let response: InBox[] = [];
    allUserExceptMe.map((otherUser) => {
      const lastMessage = allUserMessage.find((m) => {
        return m.sender.id === otherUser.id || m.reciver.id === otherUser.id;
      });
      response.push({
        user: otherUser,
        lastMessage,
      });
    });
    response = response.sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt || "1/1/1999").getTime() -
        new Date(a.lastMessage?.createdAt || "1/1/1998").getTime()
    );
    console.log(response);
    return response;
  }

  @Query(() => [Message])
  @UseMiddleware(isRunner)
  async getChat(
    @Ctx() { payload }: CustomContext,
    @Arg("otherId") otherId: String
  ): Promise<Message[]> {
    const myId = payload?.userId!;

    const chat = await Message.find({
      relations: ["sender", "reciver"],
      where: [
        { sender: myId, reciver: otherId },
        { reciver: myId, sender: otherId },
      ],
      order: {
        createdAt: "DESC",
      },
    });
    return chat;
  }
}
