import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { User } from "../../../entity/User";
import { CustomContext, Upload } from "../../../global/interface";
import { GraphQLUpload } from "graphql-upload";
import { UpdateProfileInput } from "../types/UserType";
import { storeDirectory } from "../../../config/uploadConfig";
import { createUploadUrl } from "../../../utils/upload";
import { isRunner } from "../../middleware/auth/runnerAuth";
import { getConnection } from "typeorm";
import { performNewHashData } from "../../../utils/redis";

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  @UseMiddleware(isRunner)
  async me(@Ctx() { payload }: CustomContext): Promise<User | undefined> {
    return await User.findOne({ id: payload?.userId });
  }

  @Mutation(() => User, { nullable: true })
  @UseMiddleware(isRunner)
  async updateMe(
    @Arg("input") input: UpdateProfileInput,
    @Ctx() { payload }: CustomContext
  ): Promise<User | undefined> {
    const user = await User.findOne({ id: payload?.userId });
    if (!user) {
      return undefined;
    }

    const newData = { ...user, ...input };
    const saved = await getConnection()
      .createQueryBuilder()
      .update(User)
      .set({ ...newData })
      .where("id =:id", { id: payload?.userId })
      .returning("*")
      .execute();

    console.log(newData);
    await performNewHashData({
      km: newData.km.toString(),
      displayName: `${newData.firstName} ${newData.lastName}`,
      id: payload?.userId!,
      bio: newData.bio,
    });

    return saved.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isRunner)
  async addProfilePicture(
    @Ctx() { payload }: CustomContext,
    @Arg("picture", () => GraphQLUpload)
    { createReadStream }: Upload
  ): Promise<boolean> {
    const state = await createUploadUrl({
      userId: payload?.userId!,
      createReadStream,
      mimetype: "image/png",
      directory: storeDirectory.profile,
    });
    console.log("state", state);
    return state !== null;
  }
}
