import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-page-header',
    standalone: true,
    template: `
    <div class="px-6 pt-6 pb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          @if (showBack()) {
            <button
              (click)="back.emit()"
              class="flex items-center justify-center w-9 h-9 rounded-lg
                     bg-white border border-slate-200 text-slate-500
                     hover:bg-slate-50 hover:text-primary-600 hover:border-primary-300
                     transition-all duration-200 shadow-sm cursor-pointer">
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </button>
          }
          <div>
            <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">{{ title() }}</h1>
            @if (subtitle()) {
              <p class="text-sm text-slate-500 mt-0.5">{{ subtitle() }}</p>
            }
          </div>
        </div>
        <div class="flex items-center gap-3">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class PageHeader {
    title = input.required<string>();
    subtitle = input<string>('');
    showBack = input<boolean>(false);
    back = output<void>();
}
