import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductModel } from '../models/product.model';
import { ProductService } from '../services/product.service';
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
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'products-management',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    PageHeader,
    Card,
    Tag,
    DropdownMenu,
    DropdownItem,
    DropdownDivider,
    ConfirmModal,
    Pagination,
  ],
  templateUrl: './products-management.html',
  styleUrl: './products-management.css',
})
export class ProductsManagement {
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly products = signal<ProductModel[]>([]);
  readonly loading = signal(false);

  readonly inputValue = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  readonly stockModalVisible = signal(false);
  readonly stockModalProduct = signal<ProductModel | null>(null);
  readonly stockQuantity = signal(0);
  readonly stockSubmitting = signal(false);

  readonly deleteTarget = signal<ProductModel | null>(null);
  readonly deleteSubmitting = signal(false);

  readonly filteredProducts = computed(() => {
    const query = this.inputValue().toLocaleLowerCase().trim();
    if (!query) {
      return this.products();
    }
    return this.products().filter((product) => {
      return (
        product.name.toLocaleLowerCase().includes(query) ||
        product.description?.toLocaleLowerCase().includes(query)
      );
    });
  });

  readonly totalPages = computed(() => {
    const pages = Math.ceil(this.filteredProducts().length / this.pageSize());
    return Math.max(1, pages);
  });

  readonly paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredProducts().slice(start, start + this.pageSize());
  });

  readonly deleteModalVisible = computed(() => this.deleteTarget() !== null);
  readonly deleteMessage = computed(() => {
    const product = this.deleteTarget();
    if (!product) {
      return '';
    }
    return `This will permanently remove "${product.name}" from the catalog.`;
  });

  constructor() {
    this.loadProducts();

    effect(() => {
      const totalPages = this.totalPages();
      const current = this.currentPage();
      if (current > totalPages) {
        this.currentPage.set(totalPages);
      }
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.toast.error(err.message || 'Failed to load products');
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

  navigateToCreate(): void {
    this.router.navigate(['/products/create']);
  }

  editProduct(product: ProductModel): void {
    this.stockModalProduct.set(product);
    this.stockQuantity.set(product.stock);
    this.stockModalVisible.set(true);
  }

  handleStockUpdate(): void {
    if (this.stockSubmitting()) {
      return;
    }
    const product = this.stockModalProduct();
    if (!product) {
      return;
    }
    const quantity = Math.max(0, Math.floor(Number(this.stockQuantity()) || 0));
    this.stockSubmitting.set(true);

    this.productService.updateStock(product.id, quantity).subscribe({
      next: (updatedProduct) => {
        const normalizedProduct = updatedProduct
          ? { ...updatedProduct, stock: quantity }
          : { ...product, stock: quantity };

        this.products.update((list) =>
          list.map((item) => (item.id === product.id ? normalizedProduct : item)),
        );
        this.toast.success(`Stock updated for "${normalizedProduct.name}"`);
        this.cancelStockModal();
      },
      error: (err: Error) => {
        this.toast.error(err.message || 'Failed to update stock');
        this.stockSubmitting.set(false);
      },
    });
  }

  cancelStockModal(): void {
    this.stockModalVisible.set(false);
    this.stockModalProduct.set(null);
    this.stockSubmitting.set(false);
  }

  deleteProduct(product: ProductModel): void {
    this.deleteTarget.set(product);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
    this.deleteSubmitting.set(false);
  }

  confirmDelete(): void {
    if (this.deleteSubmitting()) {
      return;
    }
    const product = this.deleteTarget();
    if (!product) {
      return;
    }
    this.deleteSubmitting.set(true);
    this.productService.delete(product.id).subscribe({
      next: () => {
        this.products.update((list) => list.filter((item) => item.id !== product.id));
        this.toast.success(`"${product.name}" deleted successfully`);
        this.cancelDelete();
      },
      error: (err: Error) => {
        this.toast.error(err.message || 'Failed to delete product');
        this.deleteSubmitting.set(false);
      },
    });
  }
}
