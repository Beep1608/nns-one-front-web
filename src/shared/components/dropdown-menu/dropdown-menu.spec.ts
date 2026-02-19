import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { DropdownItem, DropdownMenu } from './dropdown-menu';

@Component({
  standalone: true,
  imports: [DropdownMenu, DropdownItem],
  template: `
    <app-dropdown-menu>
      <app-dropdown-item>Action</app-dropdown-item>
    </app-dropdown-menu>
  `,
})
class TestHostComponent {}

describe('DropdownMenu scroll behavior', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  it('registers and removes global listeners only while menu is open', async () => {
    const addWindowSpy = vi.spyOn(window, 'addEventListener');
    const removeWindowSpy = vi.spyOn(window, 'removeEventListener');
    const addDocumentSpy = vi.spyOn(document, 'addEventListener');
    const removeDocumentSpy = vi.spyOn(document, 'removeEventListener');

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const dropdown = fixture.debugElement.query(By.directive(DropdownMenu)).componentInstance as DropdownMenu;
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(dropdown.isOpen()).toBe(false);
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dropdown.isOpen()).toBe(true);
    expect(addWindowSpy.mock.calls.some((call) => call[0] === 'resize')).toBe(true);
    expect(addDocumentSpy.mock.calls.some((call) => call[0] === 'scroll' && call[2] === true)).toBe(true);

    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dropdown.isOpen()).toBe(false);
    expect(removeWindowSpy.mock.calls.some((call) => call[0] === 'resize')).toBe(true);
    expect(removeDocumentSpy.mock.calls.some((call) => call[0] === 'scroll' && call[2] === true)).toBe(
      true,
    );
  });

  it('closes menu when a scroll event occurs', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const dropdown = fixture.debugElement.query(By.directive(DropdownMenu)).componentInstance as DropdownMenu;
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(dropdown.isOpen()).toBe(true);

    document.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dropdown.isOpen()).toBe(false);
  });
});
