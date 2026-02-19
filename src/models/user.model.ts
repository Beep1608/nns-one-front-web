export interface UserModel {
  id: number;
  username: string;
  createdAt: Date | null;
  lastActiveAt: Date | null;
  permissions: string[];
  roles: string[];
}
