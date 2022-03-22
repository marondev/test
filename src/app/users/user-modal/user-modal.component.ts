/* eslint-disable curly */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

// MATERIAL
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// OTHERS
import { FileItem, FileUploader } from 'ng2-file-upload';

// SERVICES
import { HttpService } from '@app/core/services/http/http.service';
import { SnackBarService } from '@app/core/services/snack-bar/snack-bar.service';

// ENV
import { environment } from '@env/environment';

// CONSTANT
import * as constant from '@core/data/constant';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css'],
})
export class UserModalComponent implements OnInit {
  userForm: FormGroup;

  avatar: any;
  avatar_fileName: any;
  url = environment.uploadUrl + '?token=' + sessionStorage.getItem('token');
  uploader: FileUploader = new FileUploader({
    url: this.url,
    autoUpload: true,
    allowedMimeType: ['image/png', 'image/jpeg'],
    maxFileSize: constant.fileConst.uploadImageSize,
  });

  id: any = null;
  titleIcon = 'add';
  isView = false;
  isSaving = false;

  constant: any = constant;

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    public dialogRef: MatDialogRef<UserModalComponent>,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      fullname: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80),
        ],
      ],
    });

    this.uploader.onSuccessItem = (item: FileItem, res) => {
      const data = JSON.parse(res);
      if (data.error) {
        item.remove();
      } else {
        this.avatar_fileName = data.file.filename;
        this.avatar = item.file.rawFile;
        this.uploader.clearQueue();
      }
    };

    this.uploader.onWhenAddingFileFailed = (_) => {
      this.snackBarService.errorMessage(this.constant.errConst.invalidImageFormat);
    };

    if ( this.data.action === 'create' ) {
      this.titleIcon = 'add';
    } else if ( this.data.action === 'update' ) {
      this.titleIcon = 'edit';
    } else {
      this.titleIcon = 'visibility';
    }

    if (this.data.action !== 'create' && this.data.result) this.get(this.data.result);
  }

  get(data): void {
    const { id, fullname, username, avatar } = data;
    this.id = id;

    if (avatar) {
      const byteArray = new Uint8Array(avatar.data);
      this.avatar = new Blob([byteArray], { type: 'image/png' });
    }

    this.userForm.setValue({
      fullname,
      username,
      password: '',
    });
  }

  onSubmit(): void {
    const body = this.userForm.value;
    body.avatar = this.avatar_fileName;
    body.place_id = environment.serverId;
    body.role = 'editor';

    let $request = new Observable();
    $request =
      this.data.action === 'create'
        ? this.httpService.store(this.data.segment, body)
        : this.httpService.update(this.data.segment, this.id, body);
    $request.subscribe(
      (data: any) => {
        if (!data.error) {
          this.snackBarService.successMessage('Successfully created.');
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
        this.snackBarService.errorMessage(error);
      }
    );
  }
}
