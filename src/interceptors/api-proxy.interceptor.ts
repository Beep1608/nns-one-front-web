import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../environments/environment';

/**
 * Interceptor that rewrites absolute API URLs to relative paths
 * when running in the browser, so local proxy (ng serve) and production
 * reverse proxy (nginx) can forward them and avoid CORS issues.
 *
 * In SSR (server-side), the absolute URL is kept so Node.js can reach the API directly.
 */
export const apiProxyInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  // In browsers we use same-origin "/api" so both ng proxy (dev)
  // and nginx reverse proxy (deploy) can avoid CORS issues.
  try {
    const apiOrigin = new URL(environment.apiUrl).origin;
    if (req.url.startsWith(apiOrigin)) {
      const rewritten = req.clone({
        url: req.url.replace(apiOrigin, ''),
      });
      return next(rewritten);
    }
  } catch {
    // ignore when environment.apiUrl is already relative
  }

  return next(req);
};
