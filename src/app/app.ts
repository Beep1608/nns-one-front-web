import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastContainer } from '../shared/components/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastContainer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})

export class App {
  protected readonly title = signal('Punto de Venta');
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly isSidebarCollapsed = signal(false);

  protected closeMobileNav(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((value) => !value);
  }
}
