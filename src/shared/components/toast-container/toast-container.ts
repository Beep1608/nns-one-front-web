import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
                    shadow-lg border backdrop-blur-sm min-w-[320px] max-w-md
                    animate-slide-in cursor-pointer transition-all duration-200"
             [class]="getToastClasses(toast.type)"
             (click)="toastService.remove(toast.id)">
          <i class="text-base" [class]="getIconClass(toast.type)"></i>
          <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
          <button class="text-current opacity-50 hover:opacity-100 transition-opacity">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      }
    </div>
  `,
    styles: [`
    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `],
})
export class ToastContainer {
    toastService = inject(ToastService);

    getToastClasses(type: string): string {
        switch (type) {
            case 'success':
                return 'bg-emerald-50/90 border-emerald-200 text-emerald-800';
            case 'error':
                return 'bg-red-50/90 border-red-200 text-red-800';
            default:
                return 'bg-blue-50/90 border-blue-200 text-blue-800';
        }
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'success':
                return 'fa-solid fa-circle-check text-emerald-500';
            case 'error':
                return 'fa-solid fa-circle-xmark text-red-500';
            default:
                return 'fa-solid fa-circle-info text-blue-500';
        }
    }
}
