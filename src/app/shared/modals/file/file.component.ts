/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs/internal/operators/take';
import { DomSanitizer } from '@angular/platform-browser';

// SERVICES
import { HttpService, AuthService, SnackBarService } from '@core/services';

import { ConfirmComponent } from '@shared/modals';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
})
export class FileComponent implements OnDestroy {
  currentFile: any = null;
  items: any = [];
  isPDF = true;
  loading = true;
  hasFiles = false;

  constructor(
    private dialog: MatDialog,
    private http: HttpService,
    private auth: AuthService,
    private snackBarService: SnackBarService,
    private sanitize: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.show();
  }

  show() {
    this.http.show(this.data.segment, this.data.id).subscribe(
      (res: any) => {
        if (!res.error) {
          this.items =
            this.data.segment === 'references' ? res.results : res.results.files;
          if (this.data.segment === 'references') {
            if (this.items) {
              this.hasFiles = true;
              this.readFile(this.items);
              this.items.isActive = true;
            } else {
              this.hasFiles = false;
            }
          } else {
            if (this.items.length > 0) {
              this.hasFiles = true;
              const index = typeof this.data.targetFile !== 'undefined' ? this.data.targetFile : 0;
              this.readFile(this.items[index]);
              this.items[index].isActive = true;
            } else {
              this.hasFiles = false;
            }
          }
        } else {
          this.hasFiles = false;
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.hasFiles = false;
      }
    );
  }

  ngOnDestroy(): void {
    this.currentFile = null;
    this.items = [];
  }

  onClickReadFile(file, index): void {
    if (this.data.segment === 'references' || this.items.length === 1) {
      return;
    }

    this.readFile(file);
    this.items.map((item) => {
      item.isActive = false;
      return item;
    });
    this.items[index].isActive = true;
  }

  readFile(item): void {
    const type = item.type;
    const byteArray = new Uint8Array(item.file.data);
    const blob = new Blob([byteArray], { type });
    const convertedFile = URL.createObjectURL(blob);

    const fileExtension = type.substring(type.lastIndexOf('/') + 1);
    this.isPDF = fileExtension === 'pdf';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.currentFile = {
        file: e.target.result,
        blob: this.sanitize.bypassSecurityTrustResourceUrl(convertedFile),
        blobRaw: convertedFile,
        filename: item.filename,
        type,
      };
    };
    reader.readAsArrayBuffer(blob);
  }

  log(action): void {
    this.auth
      .me()
      .pipe(take(1))
      .subscribe((user) => {
        const data = {
          user_id: user.id,
          entity_id: this.data.id,
          action,
          entity: this.data.segment,
          description: `${user.fullname} - ${action} ${this.currentFile.filename}`,
        };
        this.http.store('logs', data).subscribe( (e) => {
            if (!e.error) {
              this.snackBarService.successMessage(e.msg);
            }
            else {
              this.snackBarService.errorMessage(e.msg);
            }
          },
          (error) => {
            console.log(error);
          }
        );
      });
  }

  confirmDialog(id): void {
    if (id) {
      const segment = this.data.segment === 'sessions' ? 'session_files' : this.data.segment;
      const parentId = this.data.segment === 'sessions' ? this.data.id : 0;
      const dialogRef = this.dialog.open(ConfirmComponent, {
        data: { segment, id, parentId },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) { this.show();}
      });
    }
  }
}
