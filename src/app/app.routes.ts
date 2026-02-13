import { Routes } from '@angular/router';
import { UsersManagement } from '../users-management/users-management';
import { ProductsManagement } from '../products-management/products-management';

export const routes: Routes = [
  { path: 'products', component: ProductsManagement },
  { path: 'users', component: UsersManagement },

];
