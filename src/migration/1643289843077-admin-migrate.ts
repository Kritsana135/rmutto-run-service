import { getRepository, MigrationInterface, QueryRunner } from "typeorm";
import { User, UserRole } from "../entity/User";

const adminUserList: Array<Partial<User>> = [
  {
    email: "admin@gmail.com",
    password: "123456789",
    isVerify: true,
    userType: UserRole.ADMIN,
    firstName: "admin",
    lastName: "1",
    address: "",
    km: 0,
    phoneNumber: "",
  },
];

export class adminMigrate1643289843077 implements MigrationInterface {
  public async up(_: QueryRunner): Promise<void> {
    adminUserList.forEach(async (item) => {
      await getRepository("users").save(item);
    });
    console.log("sss")
  }

  public async down(_: QueryRunner): Promise<void> {}
}
