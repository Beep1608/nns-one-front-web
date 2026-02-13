import { UserDto } from "../dtos/user.dto";
import { UserModel } from "../models/user.model";

export class UserMapper
{
  static fromDto(dto: UserDto): UserModel{
    return {
      id: dto.id,
      username: dto.username,
      createdAt: dto.createdAt,
      lastActiveAt: dto.lastActiveAt,
      permissions: dto.permissions,
      roles: dto.roles
    };
  }
}
