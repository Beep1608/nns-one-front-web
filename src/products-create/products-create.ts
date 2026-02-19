import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateProductDto } from '../dtos/create-product.dto';
import { ProductService } from '../services/product.service';
import { Card } from '../shared/components/card/card';
import { PageHeader } from '../shared/components/page-header/page-header';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'products-create',
  standalone: true,
  templateUrl: './products-create.html',
  styleUrl: './products-create.css',
  imports: [CommonModule, ReactiveFormsModule, PageHeader, Card],
})
export class ProductsCreate {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly submitting = signal(false);

  readonly validateForm = this.fb.group({
    name: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    stock: this.fb.control(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    description: this.fb.control('', { nonNullable: true }),
  });

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

    const dto: CreateProductDto = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      price: formValue.price ?? 0,
      stock: formValue.stock,
      userId: 1,
    };

    this.productService.create(dto).subscribe({
      next: () => {
        this.toast.success('Product created successfully');
        this.router.navigate(['/products']);
      },
      error: (err: Error) => {
        this.toast.error(err.message || 'Failed to create product');
        this.submitting.set(false);
      },
    });
  }

  isInvalid(field: 'name' | 'price' | 'stock'): boolean {
    const control = this.validateForm.controls[field];
    return control.invalid && control.touched;
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
