import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  private toastsSig = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSig.asReadonly();

  show(type: ToastMessage['type'], message: string, duration = 4000): void {
    const id = ++this.counter;
    this.toastsSig.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void { this.show('success', message); }
  error(message: string): void { this.show('error', message, 6000); }
  warning(message: string): void { this.show('warning', message); }
  info(message: string): void { this.show('info', message); }

  dismiss(id: number): void {
    this.toastsSig.update(t => t.filter(toast => toast.id !== id));
  }
}
