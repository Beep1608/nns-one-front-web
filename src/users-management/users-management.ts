import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from '../models/user.model';
import { UserService } from '../services/user.service';
import { Card } from '../shared/components/card/card';
import { ConfirmModal } from '../shared/components/confirm-modal/confirm-modal';
import {
  DropdownDivider,
  DropdownItem,
  DropdownMenu,
} from '../shared/components/dropdown-menu/dropdown-menu';
import { PageHeader } from '../shared/components/page-header/page-header';
import { Pagination } from '../shared/components/pagination/pagination';
import { Tag } from '../shared/components/tag/tag';
import { PERMISSION_COLORS } from '../shared/constants/permissions.constants';
import { ROLES_COLORS } from '../shared/constants/roles.constans';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'users-management',
  standalone: true,
  imports: [
    PageHeader,
    Card,
    Tag,
    DropdownMenu,
    DropdownItem,
    DropdownDivider,
    ConfirmModal,
    Pagination,
  ],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css',
})
export class UsersManagement {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  readonly users = signal<UserModel[]>([]);
  readonly loading = signal(false);
  readonly inputValue = signal('');

  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  readonly deleteTarget = signal<UserModel | null>(null);
  readonly deleteSubmitting = signal(false);

  // readonly permissionColors = PERMISSION_COLORS;
  readonly rolesColors = ROLES_COLORS;

  readonly filteredUsers = computed(() => {
    const query = this.inputValue().toLocaleLowerCase().trim();
    if (!query) {
      return this.users();
    }
    return this.users().filter((user) => user.username.toLocaleLowerCase().includes(query));
  });

  readonly totalPages = computed(() => {
    const pages = Math.ceil(this.filteredUsers().length / this.pageSize());
    return Math.max(1, pages);
  });

  readonly paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUsers().slice(start, start + this.pageSize());
  });

  readonly deleteModalVisible = computed(() => this.deleteTarget() !== null);
  readonly deleteMessage = computed(() => {
    const user = this.deleteTarget();
    if (!user) {
      return '';
    }
    return `This will permanently remove "${user.username}" and cannot be undone.`;
  });

  constructor() {
    this.loadUsers();

    effect(() => {
      const totalPages = this.totalPages();
      const current = this.currentPage();
      if (current > totalPages) {
        this.currentPage.set(totalPages);
      }
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.toast.error(err.message || 'Failed to load users');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.inputValue.set(value);
    this.currentPage.set(1);
  }

  setPage(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());
    this.currentPage.set(nextPage);
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  // getPermissionColor(permission: string): string {
  //   return this.permissionColors[permission] || 'default';
  // }

  getRoleColor(role: string): string {
    return this.rolesColors[role] || 'default';
  }

  formatCreatedAt(value: Date | null): string {
    if (!value) {
      return '—';
    }
    return this.cleanDateLabel(this.dateTimeFormatter.format(value));
  }

  formatLastActiveAt(value: Date | null): string {
    if (!value) {
      return '—';
    }
    return this.cleanDateLabel(this.dateTimeFormatter.format(value));
  }

  navigateToCreate(): void {
    this.router.navigate(['/users/create']);
  }

  editUser(id: number): void {
    this.router.navigate(['/users/edit', id]);
  }

  viewUserProfile(id: number): void {
    this.editUser(id);
  }

  deleteUser(user: UserModel): void {
    this.deleteTarget.set(user);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
    this.deleteSubmitting.set(false);
  }

  confirmDelete(): void {
    if (this.deleteSubmitting()) {
      return;
    }
    const user = this.deleteTarget();
    if (!user) {
      return;
    }

    this.deleteSubmitting.set(true);
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((item) => item.id !== user.id));
        this.toast.success(`User "${user.username}" deleted successfully`);
        this.cancelDelete();
      },
      error: (err: Error) => {
        this.toast.error(err.message || 'Failed to delete user');
        this.deleteSubmitting.set(false);
      },
    });
  }

  private cleanDateLabel(value: string): string {
    return value.replace(/\./g, '').toLowerCase();
  }
}
