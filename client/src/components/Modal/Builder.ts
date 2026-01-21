import type { ReactNode } from 'react';
import type { ModalHeight, ModalOptions, ModalPosition, ModalWidth } from './types';


export class ModalBuilder {
  private options: Partial<ModalOptions> = {
    confirmText: 'Bestätigen',
    cancelText: 'Abbrechen',
    isDangerous: false,
  };

  private showFn: (options: ModalOptions) => void;

  constructor(showFn: (options: ModalOptions) => void) {
    this.showFn = showFn;
  }

  title(title: string): this {
    this.options.title = title;
    return this;
  }

  message(message: string): this {
    this.options.message = message;
    return this;
  }

  content(content: ReactNode): this {
    this.options.content = content;
    return this;
  }

  confirmText(text: string): this {
    this.options.confirmText = text;
    return this;
  }

  cancelText(text: string): this {
    this.options.cancelText = text;
    return this;
  }

  danger(): this {
    this.options.isDangerous = true;
    return this;
  }

  width(width: ModalWidth): this {
    this.options.width = width;
    return this;
  }

  height(height: ModalHeight): this {
    this.options.height = height;
    return this;
  }

  position(position: ModalPosition): this {
    this.options.position = position;
    return this;
  }

  onConfirm(callback: () => void | Promise<void>): this {
    this.options.onConfirm = callback;
    return this;
  }

  confirm(title: string, message: string): this {
    return this.title(title).message(message);
  }

  show(): void {
    if (!this.options.title) {
      throw new Error('Title is required');
    }
    if (!this.options.message && !this.options.content) {
      throw new Error('Either message or content is required');
    }
    this.showFn(this.options as ModalOptions);
  }
}