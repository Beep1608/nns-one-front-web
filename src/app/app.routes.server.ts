import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'products',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'products/create',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'users',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'users/create',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'users/edit/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
