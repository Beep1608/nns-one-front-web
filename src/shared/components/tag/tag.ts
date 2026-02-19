import { Component, input } from '@angular/core';

const COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-600/20' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
    red: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-600/20' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-600/20' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-600/20' },
    yellow: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', ring: 'ring-cyan-600/20' },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
    error: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-600/20' },
    default: { bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-500/20' },
};

@Component({
    selector: 'app-tag',
    standalone: true,
    template: `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset transition-colors"
          [class]="colorClasses()">
      <ng-content></ng-content>
    </span>
  `,
})
export class Tag {
    color = input<string>('default');

    colorClasses(): string {
        const c = COLOR_MAP[this.color()] || COLOR_MAP['default'];
        return `${c.bg} ${c.text} ${c.ring}`;
    }
}
