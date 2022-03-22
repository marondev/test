/* eslint-disable id-blacklist */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { firstValueFrom, Observable } from 'rxjs';
import * as moment from 'moment';

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
  selector: 'app-ordinance-modal',
  templateUrl: './ordinance-modal.component.html',
  styleUrls: ['./ordinance-modal.component.css'],
})
export class OrdinanceModalComponent implements OnInit, OnDestroy {
  ordinanceForm: FormGroup;
  authors: any = [];
  allCoAuthors: any = [];
  allCoSponsors: any = [];
  allCommittees: any = [];

  statusDates = {
    first_reading_date: { value: '', level: 1, name: 'First Reading Date' },
    committee_hearing_date: {
      value: '',
      level: 2,
      name: 'Committee Hearing Date',
    },
    second_reading_date: { value: '', level: 3, name: 'Second Reading Date' },
    third_reading_date: { value: '', level: 4, name: 'Third Reading Date' },
    ammended_date: { value: '', level: 4, name: 'Amended Date' },
    repealed_date: { value: '', level: 4, name: 'Repealed Date' },
    approved_date: { value: '', level: 5, name: 'Approved Date', same: true },
    effectivity_date: {
      value: '',
      level: 6,
      name: 'Effectivity Date',
      same: true,
    },
    publication_date: {
      value: '',
      level: 6,
      name: 'Publication Date',
      same: true,
    },
  };

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
    public dialogRef: MatDialogRef<OrdinanceModalComponent>,
    private snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    this.getMembers();
    this.getAllCommittees();

    this.ordinanceForm = this.formBuilder.group({
      number: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
        ],
      ],
      title: ['', [Validators.required]],
      committee_report_number: [''],
      committees: [[], [Validators.required]],
      author_id: ['', [Validators.required]],
      co_authors: [[]],
      co_sponsors: [[]],
      source: [''],
      first_reading_date: [this.statusDates.first_reading_date.value],
      committee_hearing_date: [this.statusDates.committee_hearing_date.value],
      second_reading_date: [this.statusDates.second_reading_date.value],
      third_reading_date: [this.statusDates.third_reading_date.value],
      ammended_date: [this.statusDates.ammended_date.value],
      repealed_date: [this.statusDates.repealed_date.value],
      approved_date: [this.statusDates.approved_date.value],
      effectivity_date: [this.statusDates.effectivity_date.value],
      publication_date: [this.statusDates.publication_date.value],
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
    this.ordinanceForm.reset();

    this.authors = [];
    this.allCoAuthors = [];
    this.allCoSponsors = [];
    this.allCommittees = [];
  }

  get(): void {
    const {
      number,
      title,
      committee_report_number,
      committees,
      author_id,
      co_authors,
      co_sponsors,
      remarks,
      source,
      ammended_date,
      approved_date,
      committee_hearing_date,
      effectivity_date,
      first_reading_date,
      publication_date,
      repealed_date,
      second_reading_date,
      third_reading_date,
    } = this.data.formData;

    this.ordinanceForm.setValue({
      number,
      title,
      committee_report_number,
      committees,
      author_id,
      co_authors,
      co_sponsors,
      remarks,
      source,
      ammended_date,
      approved_date,
      committee_hearing_date,
      effectivity_date,
      first_reading_date,
      publication_date,
      repealed_date,
      second_reading_date,
      third_reading_date,
    });

    this.files = this.data.files;
  }

  updateFileTitle(title, index): void {
    if (!title.length) {
      return;
    }
    console.log(this.files[index]);
    this.files[index].title = title;
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

  checkDate(statusKey: string) {
    const date = this.ordinanceForm.get(statusKey).value;
    this.statusDates[statusKey].value = date;
    let error = false;

    Object.keys(this.statusDates).forEach((key) => {
      if (this.statusDates[statusKey].level > this.statusDates[key].level) {
        if (moment(date).isBefore(this.statusDates[key].value, 'days')) {
          this.snackBarService.messageConfig.duration = 3000;
          this.snackBarService.errorMessage(
            `${this.statusDates[statusKey].name} cannot be before with ${this.statusDates[key].name}`
          );
          error = true;
          return;
        }
      } else if (
        this.statusDates[statusKey].level < this.statusDates[key].level
      ) {
        if (moment(date).isAfter(this.statusDates[key].value, 'days')) {
          this.snackBarService.messageConfig.duration = 3000;
          this.snackBarService.errorMessage(
            `${this.statusDates[statusKey].name} cannot be after with ${this.statusDates[key].name}`
          );
          error = true;
          return;
        }
      }
    });

    if (error) {
      setTimeout((_) => {
        this.statusDates[statusKey].value = '';
        this.ordinanceForm.get(statusKey).setValue('');
      }, 0);
    }
  }

  getStatus(status: any): string {
    if (status.ammended_date) {
      return 'Amended';
    } else if (status.repealed_date) {
      return 'Repealed';
    } else if (status.third_reading_date) {
      return 'Third Reading';
    } else if (status.second_reading_date) {
      return 'Second Reading';
    } else if (status.committee_hearing_date) {
      return 'Committee Hearing';
    } else if (status.first_reading_date) {
      return 'First Reading';
    }

    return '';
  }

  onSubmit(): void {
    this.isSaving = true;
    const body = this.ordinanceForm.value;
    body.place_id = environment.serverId;
    body.files = this.files;

    const status = {
      first_reading_date: body.first_reading_date,
      second_reading_date: body.second_reading_date,
      third_reading_date: body.third_reading_date,
      committee_hearing_date: body.committee_hearing_date,
      ammended_date: body.ammended_date,
      repealed_date: body.repealed_date,
      approved_date: body.approved_date,
      effectivity_date: body.effectivity_date,
      publication_date: body.publication_date,
    };

    // Get Status
    body.status = this.getStatus(status);

    body.first_reading_date = body.first_reading_date
      ? formatDate(body.first_reading_date, 'yyyyLLdd', 'en')
      : null;
    body.second_reading_date = body.second_reading_date
      ? formatDate(body.second_reading_date, 'yyyyLLdd', 'en')
      : null;
    body.third_reading_date = body.third_reading_date
      ? formatDate(body.third_reading_date, 'yyyyLLdd', 'en')
      : null;
    body.committee_hearing_date = body.committee_hearing_date
      ? formatDate(body.committee_hearing_date, 'yyyyLLdd', 'en')
      : null;
    body.ammended_date = body.ammended_date
      ? formatDate(body.ammended_date, 'yyyyLLdd', 'en')
      : null;
    body.repealed_date = body.repealed_date
      ? formatDate(body.repealed_date, 'yyyyLLdd', 'en')
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
