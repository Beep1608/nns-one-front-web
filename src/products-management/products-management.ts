import { Component, computed, inject, signal } from "@angular/core";
import { NzBreadCrumbModule } from "ng-zorro-antd/breadcrumb";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzPageHeaderModule } from "ng-zorro-antd/page-header";
import { NzTableModule } from "ng-zorro-antd/table";
import { UserService } from "../services/user.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NgClass } from "@angular/common";
import { PERMISSION_COLORS } from "../shared/constants/permissions.constants";
import { NzDropdownModule } from "ng-zorro-antd/dropdown";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { ROLES_COLORS } from "../shared/constants/roles.constans";
import { UserModel } from "../models/user.model";
import { NzDescriptionsModule } from "ng-zorro-antd/descriptions";
import { NzTypographyModule } from "ng-zorro-antd/typography";
import { NzSpaceModule } from "ng-zorro-antd/space";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzFlexModule } from "ng-zorro-antd/flex";
import { NzAutocompleteModule } from "ng-zorro-antd/auto-complete";

import { FormsModule } from "@angular/forms";
import { NzInputModule } from "ng-zorro-antd/input";
import { ProductModel } from "../models/product.model";
import { ProductService } from "../services/product.service";



@Component({
  selector: 'products-management',
  imports: [
    NzLayoutModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzDropdownModule,
    NzMenuModule,
    NzDescriptionsModule,
    NzTypographyModule,
    NzSpaceModule,
    NzGridModule,
    NzFlexModule,
    NzAutocompleteModule,
    NzInputModule,
    FormsModule,
  ],
  templateUrl: './products-management.html',
  styleUrl: './products-management.css',
})
export class ProductsManagement {
  listOfCurrentPageProducts: readonly ProductModel[] = [];

  private productService = inject(ProductService);

  protected products = toSignal(this.productService.getAll(), { initialValue: [] });
  loading = signal(false);
  inputValue = signal('');
  protected options = computed(() => {
    const query = this.inputValue().toLocaleLowerCase().trim();
    if (!query) return [];
    return this.products()
      .filter((product) => product.name.toLocaleLowerCase().includes(query))
      .map((product) => product.name);
  });

  readonly permissionColors = PERMISSION_COLORS;
  readonly rolesColors = ROLES_COLORS;
  readonly pageSizeOptions = [5, 10, 20, 50];

  getPermissionColor(perm: string): string {
    return this.permissionColors[perm] || 'default';
  }
  getRoleColor(role: string): string {
    return this.rolesColors[role] || 'default';
  }

  // Acción para editar
  editUser(id: number): void {
    console.log('Abriendo edición para:', id);
    // Aquí podrías disparar un Modal de NG-ZORRO
  }
  viewUserProfile(id: number): void {
    console.log('Abriendo información para:', id);
  }
  deleteUser(id: number): void {
    console.log('Eliminando información para:', id);
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly ProductModel[]): void {
    this.listOfCurrentPageProducts = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {}

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
  }
}
