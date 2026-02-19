export interface CreateUserDto {
    username: string;
    password?: string;
    roles?: string[];
    permissions?: string[];
}
