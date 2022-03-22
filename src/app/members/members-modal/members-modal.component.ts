/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// MATERIAL
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// OTHERS
import { FileItem, FileUploader } from 'ng2-file-upload';

// SERVICES
import { HttpService } from '@app/core/services/http/http.service';
import { SnackBarService } from '@app/core/services/snack-bar/snack-bar.service';

// ENV
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

// CONSTANT
import * as constant from '@core/data/constant';

@Component({
  selector: 'app-members-modal',
  templateUrl: './members-modal.component.html',
  styleUrls: ['./members-modal.component.css'],
})
export class MembersModalComponent implements OnInit {
  segment = 'members';
  membersForm: FormGroup;
  allCommittees: any = [];

  suffixes = [
    { name: 'None', value: '' },
    { name: 'Jr.', value: 'jr' },
    { name: 'Sr.', value: 'sr' },
    { name: '2nd', value: '2nd' },
    { name: '3rd', value: '3rd' },
    { name: '4th', value: '4th' },
    { name: '5th', value: '5th' },
    { name: '6th', value: '6th' },
    { name: '7th', value: '7th' },
  ];

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

  constant: any = constant;

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private snackBarService: SnackBarService,
    public dialogRef: MatDialogRef<MembersModalComponent>,
    @Inject( MAT_DIALOG_DATA ) public data: any

  ) {
    this.getAllCommittees();
  }

  ngOnInit(): void {
    this.membersForm = this.formBuilder.group({
      firstname: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      middlename: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      lastname: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      suffix: [''],
      is_current: [false, [Validators.required]],
      committees: [
        null,
        [
          Validators.required,
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

    if (this.data.action === 'update' && this.data.result) {this.get(this.data.result);}
  }

  get(data): void {
    const {
      id,
      firstname,
      middlename,
      lastname,
      suffix,
      pic,
      is_current,
      committees
    } = data;

    this.id = id;
    this.avatar = pic;

    this.membersForm.setValue({
      firstname,
      middlename,
      lastname,
      suffix,
      is_current: is_current ? '1' : '0',
      committees
    });
  }

  getAllCommittees(): void {
    this.httpService.get('committees', {}).subscribe( data => {
      const res = data.results;
      if (!data.error) {
        if ( data.total_count ) {this.allCommittees = [...res];}
      }
    }, (error) => {
      this.snackBarService.errorMessage(error);
    });
  }

  onSubmit(): void {
    const body = this.membersForm.value;
    body.avatar = this.avatar_fileName;
    body.place_id = environment.serverId;
    let $request = new Observable();
    $request = this.data.action === 'create' ?
      this.httpService.store( this.segment, body ) :
      this.httpService.update( this.segment, this.id, body);
    $request.subscribe( ( data: any ) => {
      if ( !data.error ) {
        this.snackBarService.successMessage(data.msg);
        this.dialogRef.close(true);
      };
    }, error => {
      this.snackBarService.errorMessage(error);
    });
  }
}
