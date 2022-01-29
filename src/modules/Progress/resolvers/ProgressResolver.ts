import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { CustomContext, Upload } from "../../../global/interface";
import { PaginationInput, ResponseClass } from "../../../global/types";
import { getConnection } from "typeorm";
import { Progress } from "../../../entity/Progress";
import { checkUser } from "../../../utils/auth";
import { GraphQLUpload } from "graphql-upload";
import { createUploadUrl } from "../../../utils/upload";
import { storeDirectory } from "../../../config/uploadConfig";
import { AuthMessage2, ErrorHandle } from "../../../global/error";
import dayjs from "dayjs";
import { performNewHashData, redis } from "../../../utils/redis";
import { User } from "../../../entity/User";
import {
  LeaderBoard,
  LeaderBoardRes,
  MyProgressRes,
} from "../types/ProgressType";
import { isRunner } from "../../middleware/auth/runnerAuth";

@Resolver()
export class ProgressResolver {
  @Mutation(() => ResponseClass)
  @UseMiddleware(isRunner)
  async uploadProgress(
    @Arg("picture", () => GraphQLUpload)
    { createReadStream, mimetype }: Upload,
    @Arg("km") km: number,
    @Ctx() { payload }: CustomContext
  ): Promise<ResponseClass> {
    const user = await checkUser(payload?.userId!);
    const url = await createUploadUrl({
      userId: payload?.userId!,
      createReadStream,
      mimetype,
      directory: storeDirectory.profile,
      extensionName: dayjs().unix().toString(),
    });
    if (!url) {
      return ErrorHandle(AuthMessage2.UPLOAD_FAIL);
    }
    const connection = getConnection();
    const progressRepository = connection.getRepository(Progress);
    const newProgress = new Progress();
    newProgress.km = km;
    newProgress.image = url;
    newProgress.user = user;
    await progressRepository.save(newProgress);

    return {
      code: "OK",
      message: "update progress successful!",
    };
  }

  @Query(() => MyProgressRes)
  @UseMiddleware(isRunner)
  async myProgress(@Ctx() { payload }: CustomContext): Promise<MyProgressRes> {
    const user = await checkUser(payload?.userId!);
    let rank = await redis.zrevrank("leaderboard_set", user.id);
    let km = await redis.hmget(user.id, ["name", "km"]);
    console.log("km", km);
    if (rank === null) {
      await performNewLeaderBoard();
      rank = await redis.zrevrank("leaderboard_set", user.id);
      return {
        no: rank === null ? -1 : rank + 1,
        km: parseFloat(km[1] || "0"),
      };
    }
    return { no: rank + 1, km: parseFloat(km[1] || "0") };
  }

  @Query(() => LeaderBoardRes)
  async leaderBoard(
    @Arg("input", { nullable: true }) input: PaginationInput
  ): Promise<LeaderBoardRes> {
    const page = input?.page || 1;
    const perPage = input?.perPage || 10;

    const start = (page - 1) * perPage;
    const end = start + (perPage - 1);

    const leaderBoard = await redis.zrevrange("leaderboard_set", start, end);
    const totalItems = await redis.zcard("leaderboard_set");

    let payload: [LeaderBoard?] = [];
    let tempNo = start;
    for (const id of leaderBoard) {
      let info = await redis.hmget(id, ["name", "km"]);
      if (info[0] === null) {
        const user = await checkUser(id);
        const km = user.km.toLocaleString();
        const displayName = `${user.firstName} ${user.lastName}`;
        info = [displayName, km];
        performNewHashData({ km, id, displayName }).then(() =>
          console.log("performNewHashData Successful")
        );
      }
      payload.push({
        id,
        no: ++tempNo,
        displayName: info[0]!,
        km: info[1]!,
      });
    }

    return {
      payload,
      pagination: {
        page: page,
        perPage: perPage,
        totalItems,
      },
    };
  }
}

export const performNewLeaderBoard = async () => {
  const connection = getConnection();
  let skip = 0;
  while (true) {
    const q = await connection
      .getRepository(User)
      .createQueryBuilder("u")
      .where("u.isVerify = true")
      .andWhere("u.deletedAt IS NULL")
      .take(100)
      .skip(skip)
      .getMany();
    if (q.length === 0) {
      break;
    }
    q.map(async ({ km, id }) => {
      await redis.zadd("leaderboard_set", km, id);
    });
    skip++;
  }
};
