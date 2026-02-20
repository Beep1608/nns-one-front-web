import { UserDto } from "../dtos/user.dto";
import { UserModel } from "../models/user.model";

const MONTH_INDEX: Record<string, number> = {
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dic: 11,
};

export class UserMapper {
  static fromDto(dto: UserDto): UserModel {
    return {
      id: UserMapper.resolveId(dto),
      username: dto.username,
      createdAt: UserMapper.toDate(dto.createdAt),
      lastActiveAt: UserMapper.toDate(dto.lastActiveAt),
      // permissions: [], // Default to empty array to satisfy model if needed, or if model is commented out this line might error. Wait, if I comment out in model, I should remove it here too.
      roles: UserMapper.toList(dto.roles)
    };
  }

  private static toList(values: string[] | Set<string> | undefined): string[] {
    if (!values) {
      return [];
    }
    return Array.isArray(values) ? values : Array.from(values);
  }

  private static resolveId(dto: UserDto): number {
    if (typeof dto.id === 'number') {
      return dto.id;
    }
    if (typeof dto.userId === 'number') {
      return dto.userId;
    }
    const href = dto._links?.self?.href;
    if (href) {
      const lastSegment = href.split('/').filter(Boolean).pop();
      const parsedId = Number(lastSegment);
      if (!Number.isNaN(parsedId)) {
        return parsedId;
      }
    }
    return 0;
  }

  private static toDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const normalized = value.trim().toLowerCase();
    const parts = normalized.match(/^(\d{1,2})\s+([a-z]{3}),\s*(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if (parts) {
      const day = Number(parts[1]);
      const month = MONTH_INDEX[parts[2]];
      const year = Number(parts[3]);
      const hours = Number(parts[4] ?? 0);
      const minutes = Number(parts[5] ?? 0);

      if (month !== undefined) {
        const parsed = new Date(year, month, day, hours, minutes, 0, 0);
        if (!Number.isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }

    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
}
