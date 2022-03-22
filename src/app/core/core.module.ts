import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// SERVICES
import {
  SyncService,
  AuthService,
  HttpService,
  TextService,
  PaginatorService,
  SnackBarService,
  NetworkService
} from '@core/services';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    SyncService,
    PaginatorService,
    TextService,
    AuthService,
    HttpService,
    SnackBarService,
    NetworkService
  ],
})
export class CoreModule {}
