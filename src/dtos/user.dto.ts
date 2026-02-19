export interface UserDto {
  id?: number;
  userId?: number;
  username: string;
  createdAt: string | null;
  lastActiveAt: string | null;
  permissions?: string[] | Set<string>;
  roles?: string[] | Set<string>;
  _links?: {
    self?: {
      href?: string;
    };
  };
}
