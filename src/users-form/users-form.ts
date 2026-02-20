import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { RoleModel } from '../models/role.model';
import { Card } from '../shared/components/card/card';
import { MultiSelect } from '../shared/components/multi-select/multi-select';
import { PageHeader } from '../shared/components/page-header/page-header';
// import { PERMISSION_COLORS } from '../shared/constants/permissions.constants';
import { ROLES_COLORS } from '../shared/constants/roles.constans';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'users-form',
  standalone: true,
  templateUrl: './users-form.html',
  styleUrl: './users-form.css',
  imports: [CommonModule, ReactiveFormsModule, PageHeader, Card, MultiSelect],
})
export class UsersForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);

  private readonly roleService = inject(RoleService);
  private readonly toast = inject(ToastService);

  readonly availableRoles = signal<RoleModel[]>([]);

  readonly isEditMode = signal(false);
  readonly userId = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly loading = signal(false);

  readonly roleOptions = signal<string[]>([]);
  // readonly permissionOptions = Object.keys(PERMISSION_COLORS);

  readonly validateForm = this.fb.group({
    username: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    password: this.fb.control(''),
    roles: this.fb.control<string[]>([], { nonNullable: true }),
    // permissions: this.fb.control<string[]>([], { nonNullable: true }),
  });

  ngOnInit(): void {
    this.loadRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const parsedId = Number(id);
      this.isEditMode.set(true);
      this.userId.set(parsedId);
      this.loadUser(parsedId);
      return;
    }
    this.validateForm.controls.password.addValidators(Validators.required);
    this.validateForm.controls.password.updateValueAndValidity();
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (roles) => {
        this.availableRoles.set(roles);
        this.roleOptions.set(roles.map((role) => role.name));
      },
      error: (err: Error) => {
        this.toast.error('Failed to load roles');
      },
    });
  }

  loadUser(id: number): void {
    this.loading.set(true);
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.validateForm.patchValue({
          username: user.username,
          // roles: user.roles, // user.roles might be strings (names) or objects? 
          // Assuming user.roles from backend are RoleDto[] or string[] of names?
          // UserService.getById returns UserModel. UserModel likely has roles as string[] based on previous context/mapper.
          // If UserModel roles are names, we can directly patch. 
          // If they are IDs, we need to map to names.
          roles: user.roles,
          // permissions: user.permissions,
          password: '',
        });
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.toast.error(err.message || 'Failed to load user details');
        this.loading.set(false);
        this.router.navigate(['/users']);
      },
    });
  }

  submitForm(): void {
    if (this.submitting()) {
      return;
    }
    if (this.validateForm.invalid) {
      this.validateForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formValue = this.validateForm.getRawValue();

    // Map selected role names back to IDs
    const selectedRoleNames = formValue.roles;
    const selectedRoleIds = selectedRoleNames.map(name => {
      const role = this.availableRoles().find(r => r.name === name);
      return role ? role.id : null;
    }).filter((id): id is number => id !== null);

    if (this.isEditMode()) {
      const dto: UpdateUserDto = {
        username: formValue.username.trim(),
        roles: selectedRoleIds,
        // permissions: formValue.permissions,
      };

      this.userService.update(this.userId()!, dto).subscribe({
        next: () => {
          this.toast.success('User updated successfully');
          this.router.navigate(['/users']);
        },
        error: (err: Error) => {
          this.toast.error(err.message || 'Failed to update user');
          this.submitting.set(false);
        },
      });
      return;
    }

    const dto: CreateUserDto = {
      username: formValue.username.trim(),
      password: formValue.password || '',
      roles: selectedRoleIds,
      // permissions: formValue.permissions,
    };

    this.userService.create(dto).subscribe({
      next: () => {
        this.toast.success('User created successfully');
        this.router.navigate(['/users']);
      },
      error: (err: Error) => {
        this.toast.error(err.message || 'Failed to create user');
        this.submitting.set(false);
      },
    });
  }

  isInvalid(field: 'username' | 'password'): boolean {
    const control = this.validateForm.controls[field];
    return control.invalid && control.touched;
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
