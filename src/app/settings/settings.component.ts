import { Component, OnInit } from '@angular/core';

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
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  segment = 'municipality';
  logo = null;
  logoFilename = null;
  url = environment.uploadUrl + '?token=' + sessionStorage.getItem('token');
  uploader: FileUploader = new FileUploader({
    url: this.url,
    autoUpload: true,
    allowedMimeType: ['image/png', 'image/jpeg'],
    maxFileSize: constant.fileConst.uploadImageSize,
  });

  id: any;
  ip = '';
  municipality: any;

  constant: any = constant;

  constructor(
    private httpService: HttpService,
    private snackBarService: SnackBarService,
  ) {}

  ngOnInit(): void {
    this.id = environment.serverId;
    this.get();

    this.uploader.onSuccessItem = (item: FileItem, res) => {
      const data = JSON.parse(res);
      if (data.error) {
        item.remove();
      } else {
        this.logoFilename = data.file.filename;
        this.logo = item.file.rawFile;
      };
    };

    this.uploader.onWhenAddingFileFailed = (_) => {
      this.snackBarService.errorMessage(this.constant.errConst.invalidImageFormat);
    };
  }

  get(): void {
    this.httpService.show(this.segment, this.id).subscribe(
      (data: any) => {
        if (!data.error) {
          this.municipality = data.results;
          this.ip = data.results.ip;
          if (data.results.logo !== null) {
            const byteArray = new Uint8Array(data.results.logo.data);
            this.logo = new Blob([byteArray], { type: 'image/png' });
          } else {
            this.logo = null;
          }
        };
      },
      (error) => {
        this.snackBarService.errorMessage(error);
      }
    );
  }

  update(): void {
    const body: any = {
      ip: this.ip,
    };

    if (this.uploader.queue.length !== 0) {
      body.logo = this.logoFilename;
      body.logo_version = +this.municipality?.version + 1;
    };

    this.httpService.update(this.segment, this.id, body).subscribe(
      (data: any) => {
        if (!data.error) {
          this.snackBarService.successMessage('Settings has successfully updated.');
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
