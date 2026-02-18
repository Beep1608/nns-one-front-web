import { Routes } from '@angular/router';
import { UsersManagement } from '../users-management/users-management';
import { ProductsManagement } from '../products-management/products-management';
import { ProductsCreate } from '../products-create/products-create';

export const routes: Routes = [
  { path: 'products', component: ProductsManagement },
  {path: 'products-create', component: ProductsCreate},
  { path: 'users', component: UsersManagement },

];
