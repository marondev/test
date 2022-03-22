import { Component, Inject, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
// import { COMMA, ENTER } from "@angular/cdk/keycodes";

// MATERIAL
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
// import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

// COMPONENTS
import { FileComponent } from '../file/file.component';

// OTHERS
import { FileItem, FileUploader } from 'ng2-file-upload';

// SERVICES
import { HttpService, SnackBarService } from '@core/services';

// ENV
import { environment } from '@env/environment';

// CONSTANT
import * as constant from '@core/data/constant';

export interface Input {
  name: string;
  type?: string;
  value?: any;
  optionSelect?: any;
  required?: boolean;
  placeholder?: string;
}

export interface ItemData {
  id?: number;
  segment?: string;
  action?: string;
  title: string;
  inputs: Input[];
  hasFile: boolean;
  files?: any;
}

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnDestroy {
  // separatorKeysCodes: number[] = [ENTER, COMMA];
  // selectableCommittee = true;
  // removableCommittee = true;
  // filteredCommittees: any = [];
  // selectedCommittees: any = [];

  allCommittees: any = [];
  authors: any = [];

  files: any = [];
  url = environment.uploadUrl + '?token=' + sessionStorage.getItem('token');
  uploader: FileUploader = new FileUploader({
    url: this.url,
    autoUpload: true,
    allowedFileType: ['pdf'],
    maxFileSize: constant.fileConst.uploadPDFSize,
  });
  hasBaseDropZoneOver = false;
  hasAnotherDropZoneOver = false;

  titleIcon = 'add';
  isView = false;
  isSaving = false;

  constant: any = constant;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ItemComponent>,
    private httpService: HttpService,
    private snackBarService: SnackBarService
  ) {
    if (data.action === 'create') {
      this.uploader.onSuccessItem = (item: FileItem, res) => {
        const result = JSON.parse(res);
        if (result.error) {
          item.remove();
        } else {
          this.files.push({
            title: result.file.originalname,
            file: result.file.filename,
            filename: result.file.originalname,
            type: result.file.mimetype,
          });
        }
      };
      this.uploader.onAfterAddingFile = (file) => {
        file.withCredentials = false;
      };

      this.uploader.onWhenAddingFileFailed = (_) => {
        this.snackBarService.errorMessage(
          this.constant.errConst.invalidPDFFormat
        );
      };
    } else if (this.data.action === 'update') {
      this.titleIcon = 'edit';
    } else {
      this.titleIcon = 'visibility';
      this.isView = true;
    }

    if (this.data?.inputs) {
      this.getAllCommittees();
      this.getMembers();
    }
  }

  ngOnDestroy(): void {
    this.uploader.clearQueue();
    this.authors = [];
    this.files = [];
    this.allCommittees = [];
    // this.filteredCommittees = [];
    // this.selectedCommittees = [];
  }

  async getMembers() {
    await firstValueFrom(
        this.httpService.get('members', {})
      ).then((data: any) => {
        const members = data.results.map((member) => ({
            id: member.id,
            name: `${member.firstname} ${member.lastname}`,
          }));

        this.authors = [...members];
      });
  }

  async getAllCommittees() {
    await firstValueFrom(
        this.httpService.get('committees', {})
      ).then((data: any) => {
        const res = data.results;
        if (res.length > 0) {
          const newCommittees = data.results.map((committee) => ({
              id: committee.id,
              name: committee.name,
            }));

          this.allCommittees = [...newCommittees];
          // this.filteredCommittees = [...newCommittees];
        }
      });
  }

  updateFileTitle(title, index): void {
    if ( !title.length ) {
      return;
    }
    this.files[index].title = title;
  }

  // removeCommittee({ id, name }): void {
  //   // Get the index of committees
  //   const index = this.selectedCommittees.findIndex(
  //     (data) => data.name === name
  //   );
  //   if (index != -1) {
  //     // Remove selected chip
  //     this.selectedCommittees.splice(index, 1);

  //     // Add item to filteredCommittees
  //     const newFilteredCommittees = this.allCommittees.find((data) => data.id === id);
  //     this.filteredCommittees.push(newFilteredCommittees);
  //   }
  // }
  // selectCommittee(event: MatAutocompleteSelectedEvent): void {
  //   const value = event.option.viewValue;
  //   if (!value) return;

  //   // Get the index of filteredCommittees
  //   const filteredIndex = this.filteredCommittees.findIndex(
  //     (data) => data.name == value
  //   );
  //   if (filteredIndex != -1) {
  //     // Remove item on the list of chips selection
  //     this.filteredCommittees.splice(filteredIndex, 1);
  //   }

  //   if (this.selectedCommittees) {
  //     const isExist = this.selectedCommittees.find(
  //       (member) => member.name == value
  //     );
  //     if (isExist) return;
  //   }

  //   // Find the item selected on the allCommittees data
  //   const newCommittees = this.allCommittees.find(
  //     (data) => data.name === value
  //   );

  //   // Then add to selectedCommittees
  //   this.selectedCommittees.push(newCommittees);
  // }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  removeItem(index): void {
    this.uploader.queue[index].remove();
    this.files.splice(index, 1);
  }

  viewFile(index): void {
    if (this.data.id) {
      this.dialogRef.close(false);
      this.dialog.open(FileComponent, {
        data: {
          id: this.data.id,
          segment: this.data.segment,
          targetFile: index,
        },
        width: '800px',
        height: '86vh',
        disableClose: true,
      });
    } else {
      this.snackBarService.errorMessage(this.constant.errConst.errorOccurred);
    }
  }

  membersInfoDate(body) {
    if (
      this.data.segment === 'members-awards' ||
      this.data.segment === 'members-projects'
    ) {
      if (body.month && !body.year) {
        this.snackBarService.errorMessage('Please select year.');
        return false;
      }

      if (!body.month && !body.year) {
        body.date = null;
      } else {
        body.date = (body.month || '') + ' ' + (body.year || '');
        body.date.trim();
      }

      delete body.month;
      delete body.year;
    } else {
      if (
        body.start_year > body.end_year ||
        (!body.start_year && body.end_year) ||
        (body.start_year && !body.end_year)
      ) {
        this.snackBarService.errorMessage('Invalid year.');
        return false;
      }

      if (!body.start_month && !body.start_year) {
        body.start_date = null;
      } else {
        body.start_date =
          (body.start_month || '') + ' ' + (body.start_year || '');
        body.start_date.trim();
      }

      if (!body.end_month && !body.end_year) {
        body.end_date = null;
      } else {
        body.end_date = (body.end_month || '') + ' ' + (body.end_year || '');
        body.end_date.trim();
      }

      body.date = body.start_date + ' - ' + body.end_date;

      delete body.start_month;
      delete body.start_year;
      delete body.end_month;
      delete body.end_year;
    }
    return body;
  }

  onSubmit(f: NgForm): void {
    let body = f.value;
    this.isSaving = true;

    if (
      this.data.segment === 'members-experiences' ||
      this.data.segment === 'members-awards' ||
      this.data.segment === 'members-projects' ||
      this.data.segment === 'members-educations'
    ) {
      body = this.membersInfoDate(body);
      if (!body) {return;}
    }

    body.place_id = environment.serverId;
    body.files = !this.data.hasFile ? [] : this.files;

    let $request = new Observable();
    $request =
      this.data.action === 'create'
        ? this.httpService.store(this.data.segment, body)
        : this.httpService.update(this.data.segment, this.data.id, body);
    $request.subscribe(
      (data: any) => {
        this.isSaving = true;
        if (!data.error) {
          this.snackBarService.successMessage(data.msg);
          this.dialogRef.close(true);
        } else {
          if (data.form_errors && data.form_errors.length) {
            const errMsg = [];
            data.form_errors.forEach((error) => {
              errMsg.push(error.message);
            });
            this.snackBarService.errorMessage(errMsg.join('\n'));
          } else {
            this.snackBarService.errorMessage(data.msg);
          }
        }
      },
      (error) => {
        this.isSaving = false;
        this.snackBarService.errorMessage(error);
      }
    );
  }
}
