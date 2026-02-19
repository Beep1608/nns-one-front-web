import { Component, input } from '@angular/core';

@Component({
    selector: 'app-card',
    standalone: true,
    template: `
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm
                shadow-slate-200/50 transition-shadow duration-300
                hover:shadow-md hover:shadow-slate-200/60"
         [class.max-w-xl]="narrow()"
         [class.overflow-visible]="allowOverflow()"
         [class.overflow-hidden]="!allowOverflow()">
      @if (loading()) {
        <div class="p-6 space-y-4 animate-pulse">
          <div class="h-4 bg-slate-200 rounded-full w-3/4"></div>
          <div class="h-4 bg-slate-200 rounded-full w-1/2"></div>
          <div class="h-4 bg-slate-200 rounded-full w-5/6"></div>
          <div class="h-4 bg-slate-200 rounded-full w-2/3"></div>
        </div>
      } @else {
        <div class="p-6">
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
})
export class Card {
    loading = input<boolean>(false);
    narrow = input<boolean>(false);
    allowOverflow = input<boolean>(false);
}
