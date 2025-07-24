import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'decodeUri', standalone: true })
export class DecodeUriPipe implements PipeTransform {
  transform(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
} 