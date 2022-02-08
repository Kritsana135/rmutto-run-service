import dayjs from "dayjs";
import { GraphQLUpload } from "graphql-upload";
import { User } from "../../../entity/User";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection, getRepository } from "typeorm";
import { storeDirectory } from "../../../config/uploadConfig";
import { Progress } from "../../../entity/Progress";
import { AuthMessage2, ErrorHandle } from "../../../global/error";
import { CustomContext, Upload } from "../../../global/interface";
import { PaginationInput, ResponseClass } from "../../../global/types";
import { checkUser } from "../../../utils/auth";
import {
  performNewHashData,
  performNewLeaderBoard,
  redis,
} from "../../../utils/redis";
import { createUploadUrl } from "../../../utils/upload";
import { isAdmin } from "../../middleware/auth/adminAuth";
import { isRunner } from "../../middleware/auth/runnerAuth";
import {
  ApproveTransactionInput,
  LeaderBoard,
  LeaderBoardRes,
  MyProgressRes,
  ProgressTransactionInput,
  ProgressTransactionRes,
  ProgressTxTStatus,
} from "../types/ProgressType";

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
      directory: storeDirectory.progress,
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
      console.log("performNewLeaderBoard");
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

    let leaderBoard = await redis.zrevrange("leaderboard_set", start, end);
    let totalItems = await redis.zcard("leaderboard_set");

    console.log("leaderBoard", leaderBoard);
    if (leaderBoard.length === 0) {
      console.log("performNewLeaderBoard");
      await performNewLeaderBoard();
      leaderBoard = await redis.zrevrange("leaderboard_set", start, end);
      totalItems = await redis.zcard("leaderboard_set");
    }
    let payload: [LeaderBoard?] = [];

    let tempNo = start;
    for (const id of leaderBoard) {
      let info = await redis.hmget(id, ["name", "km", "bio"]);
      if (info[0] === null) {
        const user = await checkUser(id);
        const km = user.km.toLocaleString();
        const displayName = `${user.firstName} ${user.lastName}`;
        info = [displayName, km];
        performNewHashData({ km, id, displayName, bio: user.bio }).then(() =>
          console.log("performNewHashData Successful")
        );
      }
      console.log("info", info);
      payload.push({
        id,
        no: ++tempNo,
        displayName: info[0]!,
        km: parseFloat(info[1]!) || 0,
        bio: info[2]! || "",
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

  @Query(() => ProgressTransactionRes)
  @UseMiddleware(isAdmin)
  async progressTransaction(
    @Arg("input", { nullable: true }) input: ProgressTransactionInput
  ): Promise<ProgressTransactionRes> {
    const page = input?.page || 1;
    const perPage = input?.perPage || 10;

    const start = (page - 1) * perPage;

    let query = getConnection()
      .getRepository(Progress)
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.user", "user")
      .orderBy("p.createdAt", "DESC")
      .take(perPage)
      .skip(start);

    switch (input.status) {
      case ProgressTxTStatus.APPROVE:
        query = query.where("p.isApprove =:status", { status: true });
        break;
      case ProgressTxTStatus.PENDING:
        query = query.where("p.isApprove IS NULL");
        break;
      case ProgressTxTStatus.REJECT:
        query = query.where("p.isApprove =:status", { status: false });
        break;
    }

    const payload = await query.getManyAndCount();

    return {
      payload: payload[0],
      pagination: {
        page: page,
        perPage: perPage,
        totalItems: payload[1],
      },
    };
  }

  @Mutation(() => String)
  @UseMiddleware(isAdmin)
  async approveProgress(
    @Arg("input") input: ApproveTransactionInput
  ): Promise<string> {
    const { isApprove, id, rejectReason } = input;
    console.log(isApprove, rejectReason);

    const progress = await getRepository(Progress)
      .createQueryBuilder("progress")
      .where("progress.id =:id", { id })
      .leftJoinAndSelect("progress.user", "user")
      .getOne();
    if (!progress) {
      throw new Error("not found progress");
    }
    const oldApprove = progress.isApprove;
    const incrementkm = progress.km;
    const userId = progress.user.id;
    console.log("isApprove", oldApprove);

    // อนุมัติ รายการที่ยังไม่ได้ทำอะไร
    if (isApprove && oldApprove === null) {
      progress.isApprove = isApprove;
      const progressRepository = getRepository(Progress);
      await progressRepository.save(progress);

      const user = await User.findOne({ id: progress.user.id });
      if (!user) {
        throw new Error("not found user");
      }
      user.km = user.km + incrementkm;
      const userRepository = getRepository(User);
      await userRepository.save(user);
    }
    // อนุมัติ รายการที่ยกเลิกไปแล้ว
    else if (isApprove && !oldApprove) {
      progress.isApprove = isApprove;
      progress.rejectReason = "";
      const progressRepository = getRepository(Progress);
      await progressRepository.save(progress);

      const user = await User.findOne({ id: progress.user.id });
      if (!user) {
        throw new Error("not found user");
      }
      user.km = user.km + incrementkm;
      const userRepository = getRepository(User);
      await userRepository.save(user);
    }
    // ปฎิเสธ รายการที่อนุมัติไปแล้ว
    else if (!isApprove && oldApprove) {
      progress.isApprove = isApprove;
      progress.rejectReason = rejectReason;
      const progressRepository = getRepository(Progress);
      await progressRepository.save(progress);

      const user = await User.findOne({ id: progress.user.id });
      if (!user) {
        throw new Error("not found user");
      }
      user.km = user.km - incrementkm;
      const userRepository = getRepository(User);
      await userRepository.save(user);
    }
    // ปฎิเสธ รายการที่ยังไม่ได้ทำอะไร
    else if (!isApprove && oldApprove === null) {
      progress.isApprove = isApprove;
      progress.rejectReason = rejectReason;
      const progressRepository = getRepository(Progress);
      await progressRepository.save(progress);
    }

    const updatedUser = await User.findOne({ id: userId });
    if (!updatedUser) {
      throw new Error("not found user");
    }
    await redis.zadd("leaderboard_set", updatedUser.km, updatedUser.id);
    await performNewHashData({
      km: updatedUser.km.toLocaleString(),
      bio: updatedUser.bio,
      displayName: `${updatedUser.firstName} ${updatedUser.lastName}`,
      id: updatedUser.id,
    });

    return "update success";
  }
}
