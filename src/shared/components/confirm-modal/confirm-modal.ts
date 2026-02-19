import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
             (click)="cancel.emit()"></div>

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md
                    animate-scale-in overflow-hidden">
          <div class="p-6">
            <div class="mx-auto flex items-center justify-center w-12 h-12 rounded-full
                        bg-red-100 mb-4">
              <i class="fa-solid fa-triangle-exclamation text-red-600 text-xl"></i>
            </div>

            <h3 class="text-lg font-semibold text-slate-900 text-center">{{ title() }}</h3>
            <p class="mt-2 text-sm text-slate-500 text-center">{{ content() }}</p>
          </div>
          <div class="flex gap-3 px-6 pb-6">
            <button (click)="cancel.emit()"
                    class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl
                           border border-slate-300 text-slate-700 bg-white
                           hover:bg-slate-50 transition-colors cursor-pointer">
              {{ cancelText() }}
            </button>
            <button (click)="confirm.emit()"
                    class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl
                           text-white transition-colors cursor-pointer"
                    [class]="danger() ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'">
              {{ okText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
    .animate-scale-in {
      animation: scale-in 0.2s ease-out;
    }
  `],
})
export class ConfirmModal {
  visible = input<boolean>(false);
  title = input<string>('');
  content = input<string>('');
  okText = input<string>('Confirm');
  cancelText = input<string>('Cancel');
  danger = input<boolean>(false);
  confirm = output<void>();
  cancel = output<void>();
}
