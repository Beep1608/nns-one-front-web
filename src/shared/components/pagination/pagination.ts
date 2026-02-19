import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="mt-6 border-t border-slate-200 pt-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-slate-500">
          Showing
          <span class="font-medium text-slate-700">{{ rangeStart() }}</span>
          -
          <span class="font-medium text-slate-700">{{ rangeEnd() }}</span>
          of
          <span class="font-medium text-slate-700">{{ totalItems() }}</span>
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <label class="text-xs font-medium uppercase tracking-wide text-slate-500">Rows</label>
          <select
            class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700
                   outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            [ngModel]="pageSize()"
            (ngModelChange)="onPageSizeChange($event)">
            @for (size of pageSizeOptions(); track size) {
              <option [ngValue]="size">{{ size }}</option>
            }
          </select>

          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300
                   text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="currentPage() === 1"
            (click)="pageChange.emit(currentPage() - 1)">
            <i class="fa-solid fa-chevron-left text-xs"></i>
          </button>

          @if (showLeadingEllipsis()) {
            <button
              type="button"
              class="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-300
                     px-2 text-sm text-slate-700 transition hover:bg-slate-100"
              (click)="pageChange.emit(1)">
              1
            </button>
            <span class="px-1 text-slate-400">...</span>
          }

          @for (page of visiblePages(); track page) {
            <button
              type="button"
              class="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm
                     transition"
              [class]="page === currentPage()
                ? 'border-primary-500 bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'"
              (click)="pageChange.emit(page)">
              {{ page }}
            </button>
          }

          @if (showTrailingEllipsis()) {
            <span class="px-1 text-slate-400">...</span>
            <button
              type="button"
              class="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-300
                     px-2 text-sm text-slate-700 transition hover:bg-slate-100"
              (click)="pageChange.emit(totalPages())">
              {{ totalPages() }}
            </button>
          }

          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300
                   text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="currentPage() === totalPages()"
            (click)="pageChange.emit(currentPage() + 1)">
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class Pagination {
    totalItems = input.required<number>();
    totalPages = input.required<number>();
    currentPage = input.required<number>();
    pageSize = input.required<number>();
    pageSizeOptions = input<number[]>([5, 10, 20, 50]);

    pageChange = output<number>();
    pageSizeChange = output<number>();

    visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        if (total <= 5) {
            return Array.from({ length: total }, (_, index) => index + 1);
        }

        const start = Math.max(1, current - 1);
        const end = Math.min(total, current + 1);
        const pages = new Set<number>([start, current, end]);
        return Array.from(pages).sort((a, b) => a - b);
    });

    showLeadingEllipsis = computed(() => {
        const pages = this.visiblePages();
        return pages.length > 0 && pages[0] > 2;
    });

    showTrailingEllipsis = computed(() => {
        const pages = this.visiblePages();
        return pages.length > 0 && pages[pages.length - 1] < this.totalPages() - 1;
    });

    rangeStart = computed(() => {
        if (this.totalItems() === 0) {
            return 0;
        }
        return (this.currentPage() - 1) * this.pageSize() + 1;
    });

    rangeEnd = computed(() => {
        if (this.totalItems() === 0) {
            return 0;
        }
        return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
    });

    onPageSizeChange(value: number): void {
        this.pageSizeChange.emit(Number(value));
    }
}
