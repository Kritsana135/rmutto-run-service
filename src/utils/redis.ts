import Redis from "ioredis";
import { User, UserRole } from "../entity/User";
import { getConnection } from "typeorm";
import { IPerformNewHashData } from "../modules/Progress/types/ProgressType";

export const redis = new Redis(process.env.REDIS_ENDPOINT, {
  password: process.env.REDIS_PASSWORD,
});

export const performNewHashData = async ({
  km,
  id,
  displayName,
  bio,
}: IPerformNewHashData) => {
  await redis.hmset(id, ["name", displayName, "km", km, "bio", bio]);
};

export const performNewLeaderBoard = async () => {
  const connection = getConnection();
  let skip = 0;
  while (true) {
    const q = await connection
      .getRepository(User)
      .createQueryBuilder("u")
      .where("u.isVerify = true")
      .andWhere("u.deletedAt IS NULL")
      .andWhere("u.userType =:type", { type: UserRole.RUNNER })
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
