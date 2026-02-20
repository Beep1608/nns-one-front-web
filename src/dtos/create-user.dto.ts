export interface CreateUserDto {
    username: string;
    password?: string;
    roles?: number[];
    // permissions?: string[];
}
