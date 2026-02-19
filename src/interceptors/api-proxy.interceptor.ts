import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../environments/environment';

/**
 * Interceptor that rewrites absolute API URLs to relative paths
 * when running in the browser, so the Angular dev proxy can forward them
 * and avoid CORS issues on client-side navigations.
 *
 * In SSR (server-side), the absolute URL is kept so Node.js can reach the API directly.
 */
export const apiProxyInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);

    if (isPlatformBrowser(platformId) && !environment.production) {
        const apiOrigin = 'https://puntoventa-api.nonamesystems.com';
        if (req.url.startsWith(apiOrigin)) {
            const rewritten = req.clone({
                url: req.url.replace(apiOrigin, ''),
            });
            return next(rewritten);
        }
    }

    return next(req);
};
