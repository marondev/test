/* eslint-disable id-blacklist */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { firstValueFrom, Observable } from 'rxjs';

// MATERIAL
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';

// COMPONENTS
import { FileComponent } from '@shared/modals';

// OTHERS
import { FileItem, FileUploader } from 'ng2-file-upload';

// SERVICES
import { HttpService, SnackBarService } from '@core/services';

// ENV
import { environment } from '@env/environment';

// CONSTANT
import * as constant from '@core/data/constant';

export interface Items {
  id?: number;
  title: string;
  action?: string;
}

@Component({
  selector: 'app-resolution-modal',
  templateUrl: './resolution-modal.component.html',
  styleUrls: ['./resolution-modal.component.css'],
})
export class ResolutionModalComponent implements OnInit, OnDestroy {
  resolutionForm: FormGroup;
  authors: any = [];
  allCoAuthors: any = [];
  allCoSponsors: any = [];
  allCommittees: any = [];

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
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    public dialogRef: MatDialogRef<ResolutionModalComponent>,
    private snackBarService: SnackBarService
  ) {
    this.getMembers();
    this.getAllCommittees();
  }

  ngOnInit(): void {
    this.resolutionForm = this.formBuilder.group({
      number: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
        ],
      ],
      approved_date: ['', [Validators.required]],
      title: ['', [Validators.required]],
      author_id: ['', [Validators.required]],
      co_authors: [[]],
      co_sponsors: [[]],
      committees: [[], [Validators.required]],
      session_date: ['', [Validators.required]],
      remarks: [''],
    });

    if (this.data.action === 'create') {
      this.uploader.onSuccessItem = (item: FileItem, res) => {
        const data = JSON.parse(res);
        if (data.error) {
          item.remove();
        } else {
          this.files.push({
            title: data.file.originalname,
            file: data.file.filename,
            filename: data.file.filename,
            type: data.file.mimetype,
          });
        }
      };

      this.uploader.onWhenAddingFileFailed = (_) => {
        this.snackBarService.errorMessage(
          this.constant.errConst.invalidPDFFormat
        );
      };
    } else if (this.data.action === 'update') {
      this.titleIcon = 'edit';
    } else {
      this.get();
      this.titleIcon = 'visibility';
      this.isView = true;
    }
  }

  ngOnDestroy(): void {
    // Remove images on queue
    this.uploader.clearQueue();

    // Remove all the files
    this.files = [];

    // Reset Data
    this.resolutionForm.reset();

    this.authors = [];
    this.allCoAuthors = [];
    this.allCoSponsors = [];
    this.allCommittees = [];
  }

  get(): void {
    const {
      number,
      title,
      committees,
      author_id,
      co_authors,
      co_sponsors,
      remarks,
      session_date,
      approved_date,
    } = this.data.formData;

    this.resolutionForm.setValue({
      number,
      title,
      committees,
      author_id,
      co_authors,
      co_sponsors,
      remarks,
      session_date,
      approved_date,
    });

    this.files = this.data.files;
  }

  updateFileTitle(value, index): void {
    if (value.length < 1) {return;}
    this.files[index].title = value;
  }

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

  async getMembers() {
    await firstValueFrom(
        this.httpService.get('members', {})
      ).then((data: any) => {
        const members = data.results.map((author) => ({
            id: author.id,
            name: `${author.firstname} ${author.lastname}`,
          }));
        this.authors = [...members];
        this.allCoAuthors = [...members];
        this.allCoSponsors = [...members];
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
        }
      });
  }

  onSubmit(): void {
    this.isSaving = true;
    const body = this.resolutionForm.value;
    body.files = this.files;
    body.place_id = environment.serverId;
    body.session_date = body.session_date
      ? formatDate(body.session_date, 'yyyyLLdd', 'en')
      : null;

    let $request = new Observable();
    $request =
      this.data.action === 'create'
        ? this.httpService.store(this.data.segment, body)
        : this.httpService.update(this.data.segment, this.data.id, body);
    $request.subscribe(
      (data: any) => {

        this.isSaving = false;
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
