import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  loadingEmitter = new EventEmitter();

  constructor() { }

  loadingEmit(isLoading: boolean): void {
    this.loadingEmitter.emit(isLoading);
  }
}
