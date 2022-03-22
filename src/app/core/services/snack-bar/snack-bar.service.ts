import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  hPos: MatSnackBarHorizontalPosition = 'right';
  vPos: MatSnackBarVerticalPosition = 'top';
  messageConfig = {
    duration: 2000,
    horizontalPosition: this.hPos,
    verticalPosition: this.vPos,
    panelClass: ''
  };
  constructor(
    private snackBar: MatSnackBar
  ) { }

  successMessage( msg: string ): void {
    this.messageConfig.panelClass = 'snackbar-success';
    this.snackBar.open(msg, 'Ok', this.messageConfig);
  }
  errorMessage( msg: string ): void {
    this.messageConfig.panelClass = 'snackbar-error';
    this.snackBar.open(msg, 'Ok', this.messageConfig);
  }
  infoMessage( msg: string ): void {
    this.messageConfig.panelClass = 'snackbar-info';
    this.snackBar.open(msg, 'Ok', this.messageConfig);
  }
}
