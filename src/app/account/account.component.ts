/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// OTHERS
import { FileItem, FileUploader } from 'ng2-file-upload';

// SERVICES
import { HttpService, SnackBarService, AuthService } from '@core/services';

// ENV
import { environment } from '@env/environment';
import * as constant from '@core/data/constant';


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  segment = 'users';
  userForm: FormGroup;
  user: any = {};

  avatar_fileName: any;
  url = environment.uploadUrl + '?token=' + sessionStorage.getItem('token');
  uploader: FileUploader = new FileUploader({
    url: this.url,
    autoUpload: true,
    allowedMimeType: ['image/png', 'image/jpeg'],
    maxFileSize: constant.fileConst.uploadImageSize,
  });

  isShowPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private snackBarService: SnackBarService,
    private authService: AuthService
  ) {
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
  }

  ngOnInit(): void {
    this.get();
    this.uploader.onSuccessItem = (item: FileItem, res) => {
      const data = JSON.parse(res);
      if (data.error) {
        item.remove();
      } else {
        this.avatar_fileName = data.file.filename;
        this.user.avatar = item.file.rawFile;
        this.uploader.clearQueue();
      }
    };
  }

  setShowPassword(value): void {
    this.isShowPassword = value;
  }

  get(): void {
    this.authService.me(true).subscribe((user) => {
        if (user) {
          this.user = user;
          this.userForm.setValue({
            fullname: user.fullname,
            username: user.username,
            password: '',
          });
          if (this.user.avatar) {
            const byteArray = new Uint8Array(this.user.avatar.data);
            this.user.avatar = new Blob([byteArray], { type: 'image/png' });
          }
        }
      },
      (error) => this.snackBarService.errorMessage(error)
    );
  }

  onSubmit(): void {
    const body = this.userForm.value;
    body.role = this.authService.getRole();
    body.avatar = this.avatar_fileName ? this.avatar_fileName : null;
    this.httpService.update(this.segment, this.user.id, body).subscribe(
      (data: any) => {
        if (!data.error) {
          this.snackBarService.successMessage(data.msg);
          this.authService.avatarEmit(true);
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
