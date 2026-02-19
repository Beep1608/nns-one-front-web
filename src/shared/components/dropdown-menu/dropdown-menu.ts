import {
    Component,
    DestroyRef,
    ElementRef,
    HostListener,
    ViewChild,
    inject,
    input,
    signal,
} from '@angular/core';

@Component({
    selector: 'app-dropdown-menu',
    standalone: true,
    template: `
    <div class="relative inline-block">
      <button #triggerButton
              (click)="toggle()"
              class="flex items-center justify-center w-8 h-8 rounded-lg
                     text-slate-400 hover:text-primary-600 hover:bg-slate-100
                     transition-all duration-200 cursor-pointer">
        <i class="fa-solid fa-ellipsis text-base"></i>
      </button>

      @if (isOpen()) {
        <div #menuPanel
                    class="fixed w-48 bg-white rounded-xl
                    shadow-lg shadow-slate-200/80 border border-slate-200/80
                    py-1.5 z-[2000] animate-dropdown overflow-hidden"
             [style.top.px]="menuTop()"
             [style.left.px]="menuLeft()"
             (click)="close()">
          <ng-content></ng-content>
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
export class DropdownMenu {
    isOpen = signal(false);
    menuTop = signal(0);
    menuLeft = signal(0);
    private removeResizeListener?: () => void;
    private removeScrollListener?: () => void;
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild('triggerButton', { read: ElementRef }) triggerButton?: ElementRef<HTMLButtonElement>;
    @ViewChild('menuPanel', { read: ElementRef }) menuPanel?: ElementRef<HTMLDivElement>;

    constructor(private el: ElementRef) {
        this.destroyRef.onDestroy(() => this.removeWindowListeners());
    }

    toggle(): void {
        if (this.isOpen()) {
            this.close();
            return;
        }

        this.isOpen.set(true);
        this.bindWindowListeners();
        requestAnimationFrame(() => this.positionMenu());
        setTimeout(() => this.positionMenu(), 0);
    }

    close(): void {
        this.isOpen.set(false);
        this.removeWindowListeners();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.el.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
            this.removeWindowListeners();
        }
    }

    private bindWindowListeners(): void {
        this.removeWindowListeners();

        const handleResize = () => {
            if (this.isOpen()) {
                this.positionMenu();
            }
        };

        const handleScroll = () => {
            if (this.isOpen()) {
                // Closing on scroll avoids expensive reposition work on every tick
                // across large table lists and prevents scroll jank.
                this.close();
            }
        };

        window.addEventListener('resize', handleResize, { passive: true });
        document.addEventListener('scroll', handleScroll, true);

        this.removeResizeListener = () => window.removeEventListener('resize', handleResize);
        this.removeScrollListener = () => document.removeEventListener('scroll', handleScroll, true);
    }

    private removeWindowListeners(): void {
        this.removeResizeListener?.();
        this.removeResizeListener = undefined;
        this.removeScrollListener?.();
        this.removeScrollListener = undefined;
    }

    private positionMenu(): void {
        const triggerEl = this.triggerButton?.nativeElement;
        if (!triggerEl) {
            return;
        }

        const triggerRect = triggerEl.getBoundingClientRect();
        const panelWidth = this.menuPanel?.nativeElement.offsetWidth ?? 192;
        const panelHeight = this.menuPanel?.nativeElement.offsetHeight ?? 168;
        const viewportPadding = 8;
        const gap = 6;
        const clipRect = this.getClipRect(triggerEl);

        let left = triggerRect.right - panelWidth;
        const minLeft = Math.max(viewportPadding, clipRect.left + viewportPadding);
        const maxLeft = Math.min(window.innerWidth - panelWidth - viewportPadding, clipRect.right - panelWidth - viewportPadding);
        left = Math.max(minLeft, Math.min(left, maxLeft));

        const availableBelow = clipRect.bottom - triggerRect.bottom - gap;
        const availableAbove = triggerRect.top - clipRect.top - gap;

        let top: number;
        if (availableBelow >= panelHeight || availableBelow >= availableAbove) {
            top = triggerRect.bottom + gap;
        } else {
            top = triggerRect.top - panelHeight - gap;
        }

        top = Math.max(viewportPadding, Math.min(top, window.innerHeight - panelHeight - viewportPadding));

        this.menuLeft.set(Math.round(left));
        this.menuTop.set(Math.round(top));
    }

    private getClipRect(element: HTMLElement): DOMRect {
        const parent = this.findClipParent(element);
        if (!parent) {
            return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
        }
        return parent.getBoundingClientRect();
    }

    private findClipParent(element: HTMLElement): HTMLElement | null {
        let current: HTMLElement | null = element.parentElement;
        while (current && current !== document.body) {
            const style = window.getComputedStyle(current);
            const overflowY = style.overflowY;
            if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden' || overflowY === 'clip') {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }
}

@Component({
    selector: 'app-dropdown-item',
    standalone: true,
    template: `
    <button class="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm
                   transition-colors cursor-pointer"
            [class]="danger()
              ? 'text-red-600 hover:bg-red-50'
              : 'text-slate-700 hover:bg-slate-50'">
      <ng-content></ng-content>
    </button>
  `,
})
export class DropdownItem {
    danger = input<boolean>(false);
}

@Component({
    selector: 'app-dropdown-divider',
    standalone: true,
    template: `<div class="my-1 border-t border-slate-100"></div>`,
})
export class DropdownDivider { }
