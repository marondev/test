import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// SERVICES
import { HttpService, SnackBarService } from '@core/services';
@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {

  constructor(
    @Inject( MAT_DIALOG_DATA ) public data: any,
    public dialogRef: MatDialogRef<ConfirmComponent>,
    private http: HttpService,
    private snackBar: SnackBarService
  ) { }

  destroy(): void {

    // This is for session files
    const parentId = this.data.parentId || 0;

    this.http.destroy( this.data.segment, this.data.id, parentId ).subscribe( res => {
      if ( !res.error ) {
        this.snackBar.successMessage('You have successfully deleted an item.');
        this.dialogRef.close(true);
      } else {
        this.snackBar.errorMessage('An error occurred.');
      };
    }, (error) => {
      this.snackBar.errorMessage(error);
    });
  }
}
