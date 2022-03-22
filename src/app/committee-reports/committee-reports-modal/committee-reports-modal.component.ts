/* eslint-disable id-blacklist */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-committee-reports-modal',
  templateUrl: './committee-reports-modal.component.html',
  styleUrls: ['./committee-reports-modal.component.css'],
})
export class CommitteeReportsModalComponent implements OnInit, OnDestroy {
  committeeReportsForm: FormGroup;
  authors: any = [];
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

  types: any = [
    { id: 'committee-report', name: 'Committee Report' },
    { id: 'chairmans-report', name: 'Chairman\'s Report' },
  ];

  remarks: any = [
    { id: 'adopted', name: 'Adopted' },
    { id: 'not-adopted', name: 'Not Adopted' },
    { id: 'deferred', name: 'Deferred' },
    { id: 'lost', name: 'Lost' },
  ];

  titleIcon = 'add';
  isView = false;
  isSaving = false;

  constant: any = constant;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    public dialogRef: MatDialogRef<CommitteeReportsModalComponent>,
    private snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    this.committeeReportsForm = this.formBuilder.group({
      number: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
        ],
      ],
      type: ['', [Validators.required]],
      author_id: ['', [Validators.required]],
      delivery_date: ['', [Validators.required]],
      remarks: [''],
      description: [''],
      is_committee: [false],
      committees: [[]],
    });

    this.getAllAuthors();
    this.getAllCommittees();

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
    } else if ( this.data.action === 'update' ) {
      this.titleIcon = 'edit';
    } else {
      this.get();
      this.isView = true;
      this.titleIcon = 'visibility';

    }

    this.committeeReportsForm.get('committees').valueChanges.subscribe(val => {
      if (val) {
        this.committeeReportsForm.get('is_committee').setValue( val.length === this.allCommittees.length );
      }
    });
  }

  ngOnDestroy(): void {
    this.committeeReportsForm.reset();
    this.uploader.clearQueue();
    this.authors = [];
    this.files = [];
    this.allCommittees = [];
  }

  get() {
    const {
      number,
      type,
      author_id,
      delivery_date,
      remarks,
      description,
      is_committee,
      committees,
    } = this.data.formData;

    this.committeeReportsForm.setValue({
      number,
      type,
      author_id,
      delivery_date,
      remarks,
      description,
      is_committee,
      committees
    });

    this.files = this.data.files;
  }

  setIsCommittee(e): void {
    this.committeeReportsForm.get('is_committee').setValue(e.checked);
    if (e.checked) {
      const getCommitteeIds = this.allCommittees.map( data => data.id );
      this.committeeReportsForm.get('committees').setValue(getCommitteeIds);
    } else {
      this.committeeReportsForm.get('committees').setValue([]);
    }
  }

  updateFileTitle(value, index: number): void {
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

  async getAllAuthors() {
    await firstValueFrom(
      this.httpService.get('members', {})
    ).then((data: any) => {
      this.authors = data.results.map((author) => ({
          id: author.id,
          name: `${author.firstname} ${author.lastname}`,
        }));
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
    const body = this.committeeReportsForm.value;
    body.place_id = environment.serverId;
    body.files = this.files;
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
