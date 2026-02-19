import { Routes } from '@angular/router';
import { UsersManagement } from '../users-management/users-management';
import { ProductsManagement } from '../products-management/products-management';
import { ProductsCreate } from '../products-create/products-create';
import { UsersForm } from '../users-form/users-form';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  { path: 'products', component: ProductsManagement },
  { path: 'products/create', component: ProductsCreate },
  { path: 'users', component: UsersManagement },
  { path: 'users/create', component: UsersForm },
  { path: 'users/edit/:id', component: UsersForm },
  { path: '**', redirectTo: 'products' },
];
