import {
    Component,
    ElementRef,
    HostListener,
    forwardRef,
    input,
    signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-multi-select',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultiSelect),
            multi: true,
        },
    ],
    template: `
    <div class="relative">
      <!-- Trigger -->
      <div (click)="toggleDropdown()"
           class="min-h-[42px] w-full flex flex-wrap items-center gap-1.5 px-3 py-2
                  bg-white border rounded-xl cursor-pointer transition-all duration-200"
           [class]="triggerClasses()"
           [attr.aria-disabled]="disabled()">

        @for (item of selectedItems(); track item) {
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                       bg-primary-50 text-primary-700 text-xs font-medium">
            {{ item }}
            <button type="button"
                    (click)="removeItem($event, item)"
                    [disabled]="disabled()"
                    class="hover:text-primary-900 transition-colors cursor-pointer">
              <i class="fa-solid fa-xmark text-[10px]"></i>
            </button>
          </span>
        }

        @if (selectedItems().length === 0) {
          <span class="text-slate-400 text-sm">{{ placeholder() }}</span>
        }

        <i class="fa-solid fa-chevron-down text-xs text-slate-400 ml-auto transition-transform duration-200"
           [class.rotate-180]="isOpen()"></i>
      </div>

      <!-- Dropdown -->
      @if (isOpen()) {
        <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200
                    rounded-xl shadow-lg shadow-slate-200/80 z-40 max-h-48 overflow-y-auto
                    animate-dropdown py-1">
          @for (option of options(); track option) {
            <button type="button"
                    (click)="toggleOption(option)"
                    class="w-full flex items-center justify-between px-3.5 py-2 text-sm
                           text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
              <span>{{ option }}</span>
              @if (isSelected(option)) {
                <i class="fa-solid fa-check text-primary-600 text-xs"></i>
              }
            </button>
          }

          @if (options().length === 0) {
            <div class="px-3.5 py-2 text-sm text-slate-400">No options available</div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    @keyframes dropdown {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-dropdown {
      animation: dropdown 0.15s ease-out;
    }
  `],
})
export class MultiSelect implements ControlValueAccessor {
    options = input<string[]>([]);
    placeholder = input<string>('Select...');

    isOpen = signal(false);
    selectedItems = signal<string[]>([]);
    disabled = signal(false);

    private onChange: (value: string[]) => void = () => { };
    private onTouched: () => void = () => { };

    constructor(private el: ElementRef) { }

    writeValue(value: string[]): void {
        this.selectedItems.set(value || []);
    }

    registerOnChange(fn: (value: string[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
        if (isDisabled) {
            this.isOpen.set(false);
        }
    }

    toggleDropdown(): void {
        if (this.disabled()) {
            return;
        }
        this.isOpen.update((v) => !v);
        this.onTouched();
    }

    toggleOption(option: string): void {
        if (this.disabled()) {
            return;
        }
        this.selectedItems.update((items) => {
            const result = items.includes(option)
                ? items.filter((i) => i !== option)
                : [...items, option];
            this.onChange(result);
            return result;
        });
    }

    removeItem(event: MouseEvent, item: string): void {
        event.stopPropagation();
        if (this.disabled()) {
            return;
        }
        this.selectedItems.update((items) => {
            const result = items.filter((i) => i !== item);
            this.onChange(result);
            return result;
        });
    }

    isSelected(option: string): boolean {
        return this.selectedItems().includes(option);
    }

    triggerClasses(): string {
        if (this.disabled()) {
            return 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed';
        }
        return this.isOpen()
            ? 'border-primary-400 ring-2 ring-primary-100'
            : 'border-slate-300 hover:border-slate-400';
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.el.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
        }
    }
}
