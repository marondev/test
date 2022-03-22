/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { firstValueFrom, Observable, Subject } from 'rxjs';

// MATERIAL
import { MatDialog } from '@angular/material/dialog';

// COMPONENTS
import { CommitteeReportsModalComponent } from '@app/committee-reports/committee-reports-modal/committee-reports-modal.component';
import { ConfirmComponent, FileComponent } from '@shared/modals';

// SERVICES
import {
  HttpService,
  SnackBarService,
  PaginatorService,
  TextService,
  SyncService,
  LoadingService,
  AuthService,
  User
} from '@core/services';

// CONSTANT
import * as constant from '@core/data/constant';

@Component({
  selector: 'app-committee-reports',
  templateUrl: './committee-reports.component.html',
  styleUrls: ['./committee-reports.component.css'],
})
export class CommitteeReportsComponent implements OnInit {
  segmentTitle = 'Committee Report';
  segment = 'committee-reports';
  committeeReports: any = [];
  params = {
    take: 10,
    offset: 0,
    q: '',
    filter: '',
    ref: 'author,committees',
    f: '',
    order_by: '',
    order_field: '',
  };
  isAsc = false;
  paginator: any;
  searchModelChanged: Subject<string> = new Subject<string>();

  types: any = [
    { id: '', name: 'All' },
    { id: 'Committee Report', name: 'Committee Report' },
    { id: 'Chairman\'s Report', name: 'Chairman\'s Report' },
  ];

  constant: any = constant;
  isSyncing: boolean;
  user$: Observable<User>;

  constructor(
    private dialog: MatDialog,
    private httpService: HttpService,
    private snackBarService: SnackBarService,
    private paginatorService: PaginatorService,
    private textService: TextService,
    private syncService: SyncService,
    private loadingService: LoadingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.get();
    this.user$ = this.authService.me();

    this.searchModelChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((newInput) => {
        this.params.q = newInput;
        this.params.offset = 0;
        this.get();
      });
  }

  get(): void {
    this.committeeReports = [];
    this.httpService.get(this.segment, this.params).subscribe(
      (data: any) => {
        if (!data.error) {
          if (data.results_count) {
            this.committeeReports = data.results;
            this.paginator = this.paginatorService.paginate(
              data.total_count,
              this.params.take,
              this.params.offset,
              5
            );
          }
        }
      },
      (error) => {
        this.snackBarService.errorMessage(error);
      }
    );
  }

  sort(field): void {
    this.params.order_field = field;
    this.params.order_by = this.isAsc ? 'DESC' : 'ASC';
    this.isAsc = this.isAsc ? false : true;
    this.get();
  }

  filter(): void {
    this.params.offset = 0;
    this.get();
  }

  nextPage(): void {
    this.params.offset = this.paginator.nextPageOffset;
    this.get();
  }

  prevPage(): void {
    this.params.offset = this.paginator.prevPageOffset;
    this.get();
  }

  goToPage(page): void {
    if (page === this.paginator.currrentPage) {return;}
    this.params.offset = (page - 1) * this.params.take;
    this.get();
  }

  openDialog(id = -1, action = 'create') {
    const data: any = {
      title: `${action} ${this.segmentTitle}`,
      segment: this.segment,
      action,
    };

    if (id !== -1) {
      firstValueFrom(
        this.httpService.show(this.segment, id)
      ).then( async (res: any) => {
          if (!res.error) {
            if (res.results_count) {
              data.formData = res.results;
              data.formData.delivery_date = this.textService.formatDefaultDate(data.formData.delivery_date);
              data.id = id;
              data.files = data.formData.files.length > 0
                ? data.formData.files.map((file) => ({
                      title: file.title,
                      file: file.filename,
                      filename: file.filename,
                      type: file.type,
                    }))
                : [];

              if ( data.formData.is_committee ) {
                await firstValueFrom(
                  this.httpService.get('committees', {})
                ).then( (commiteeData: any) => {
                  const commiteeDataResults = commiteeData.results;
                  if (commiteeData.results_count) {
                    const newCommittees = commiteeDataResults.map((committee) => committee.id);
                    data.formData.committees = [...newCommittees];
                  }
                });
              } else {
                const newCommittees = data.formData.committees.map((committee) => committee.committee_id );
                data.formData.committees = [...newCommittees];
              }

              this.getDialog(data);
            } else {
              this.snackBarService.errorMessage(this.constant.errConst.noResultsFound);
              return;
            }
          } else {
            if (res.form_errors && res.form_errors.length) {
              res.form_errors.forEach((error) => {
                this.snackBarService.errorMessage(error.message);
              });
            } else {
              this.snackBarService.errorMessage(res.msg);
            }
            return;
          }
        });
    } else {
      this.getDialog(data);
    }
  }

  getDialog(data): void {
    const dialogRef = this.dialog.open(CommitteeReportsModalComponent, {
      data,
      width: constant.defaultConst.entryModalWidth,
      disableClose: data.action !== 'view' ? true : false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {this.get();}
    });
  }

  fileDialog(id): void {
    if (id) {
      this.dialog.open(FileComponent, {
        data: { id, segment: this.segment },
        width: constant.fileConst.fileModalWidth,
        height: constant.fileConst.fileModalHeight,
      });
    }
  }

  confirmDialog(id): void {
    if (id) {
      const dialogRef = this.dialog.open(ConfirmComponent, {
        data: { segment: this.segment, id },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {this.get();}
      });
    }
  }

  sync(): void {
    this.isSyncing = true;
    this.loadingService.loadingEmit(this.isSyncing);
    this.syncService
      .sync(this.segment)
      .then((res: any) => {
        if (!res.error) {
          if (res.result) {
            this.snackBarService.successMessage(res.message);
          } else {
            this.snackBarService.infoMessage(res.message);
          }
        } else {
          this.snackBarService.errorMessage(res.message);
        }
        this.isSyncing = false;
        this.loadingService.loadingEmit(this.isSyncing);
      })
      .catch((_) => {
        this.snackBarService.infoMessage(constant.errConst.errorOccurred);
        this.isSyncing = false;
        this.loadingService.loadingEmit(this.isSyncing);
      });
  }
}
