export interface UserDto {
  id: number;
  username: string;
  createdAt: string;
  lastActiveAt: string;
  permissions: Set<string>;
  roles: Set<string>;
}
