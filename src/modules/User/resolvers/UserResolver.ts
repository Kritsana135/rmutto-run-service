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
    return user.save({ data: { ...user, ...input } });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isRunner)
  async addProfilePicture(
    @Ctx() { payload }: CustomContext,
    @Arg("picture", () => GraphQLUpload)
    { createReadStream, mimetype }: Upload
  ): Promise<boolean> {
    return !(await createUploadUrl({
      userId: payload?.userId!,
      createReadStream,
      mimetype,
      directory: storeDirectory.profile,
    }));
  }
}
