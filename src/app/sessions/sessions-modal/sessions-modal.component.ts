/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable id-blacklist */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';

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
  selector: 'app-sessions-modal',
  templateUrl: './sessions-modal.component.html',
  styleUrls: ['./sessions-modal.component.css'],
})
export class SessionsModalComponent implements OnInit, OnDestroy {
  sessionForm: FormGroup;
  allMembers: any = [];

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
    { id: 'regular', name: 'Regular' },
    { id: 'special', name: 'Special' },
  ];

  titleIcon = 'add';
  isView = false;
  isSaving = false;

  constant: any = constant;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<SessionsModalComponent>,
    private formBuilder: FormBuilder,
    private snackBarService: SnackBarService,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.sessionForm = this.formBuilder.group({
      number: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
        ],
      ],
      type: ['', [Validators.required]],
      date: ['', [Validators.required]],
      description: [''],
      members_present: [false],
      members: [[]],
      note: ['']
    });

    this.getAllMembers();

    this.uploader.onSuccessItem = (item: FileItem, res) => {
      const result = JSON.parse(res);
      console.log(result);
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

    this.uploader.onWhenAddingFileFailed = (_) => {
      this.snackBarService.errorMessage(
        this.constant.errConst.invalidPDFFormat
      );
    };

    const action = this.data.action;
    if (action === 'update') {
      this.titleIcon = 'edit';
      this.isView = false;
      this.get();
    } else if (action === 'view') {
      this.get();
      this.titleIcon = 'visibility';
      this.isView = true;
    }

    this.sessionForm.get('members').valueChanges.subscribe((val) => {
      if ( val ) {
        this.sessionForm
        .get('members_present')
        .setValue(this.allMembers.length === val.length && val.length !== 0);
      }
    });
  }

  ngOnDestroy(): void {
    // Remove images on queue
    this.uploader.clearQueue();

    // Remove all the files
    this.files = [];

    // Reset Data
    this.sessionForm.reset();

    // Clear Members
    this.allMembers = [];
  }

  get(): void {

    const { number, type, date, members, description, note } = this.data.formData;

    this.sessionForm.setValue({
      number,
      type,
      date,
      members,
      members_present: false,
      description,
      note
    });

  }

  updateFileTitle(oldValue, newValue): void {
    if (newValue.length < 1) {
      return;
    }
    this.files.map((data) => {
      if (data.filename === oldValue) {
        data.title = newValue;
      }
    });
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
      this.dialogRef.close(true);
      this.dialog.open(FileComponent, {
        data: {
          id: this.data.id,
          segment: this.data.segment,
          targetFile: index,
        },
        width: constant.fileConst.fileModalWidth,
        height: constant.fileConst.fileModalHeight,
        disableClose: true,
      });
    } else {
      this.snackBarService.errorMessage(this.constant.errConst.errorOccurred);
    }
  }

  isAllMembers(e): void {
    if (e.checked) {
      const getMembers = this.allMembers.map((member) => member.id);
      this.sessionForm.get('members').setValue(getMembers);
    } else {
      this.sessionForm.get('members').setValue([]);
    }
  }

  getAllMembers() {
    this.httpService.get('members', {}).subscribe((data: any) => {
      const res = data.results;
      if (res.length > 0) {

        const newMembers = data.results.filter( filterMember => filterMember.is_current === true).map( member => ({
            id: member.id,
            name: `${member.firstname} ${member.lastname}`,
          }));

        this.allMembers = [...newMembers];

        if (this.data.action !== 'create' && this.allMembers.length > 0) {
          this.sessionForm
            .get('members_present')
            .setValue(
              this.allMembers.length === this.data.formData.members.length &&
                this.data.formData.members.length !== 0
            );
        }
      }
    });
  }

  onSubmit(): void {
    this.isSaving = true;
    const body = this.sessionForm.value;
    body.files = this.files;
    body.place_id = environment.serverId;
    body.date = formatDate(body.date, 'yyyyLLdd', 'en');
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
