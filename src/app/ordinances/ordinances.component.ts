/* eslint-disable id-blacklist */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import * as moment from 'moment';

// MATERIAL
import { MatDialog } from '@angular/material/dialog';

// COMPONENTS
import { ConfirmComponent, FileComponent } from '@shared/modals';
import { OrdinanceModalComponent } from '@app/ordinances/ordinance-modal/ordinance-modal.component';

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
  selector: 'app-ordinances',
  templateUrl: './ordinances.component.html',
  styleUrls: ['./ordinances.component.css'],
  providers:[SyncService]
})
export class OrdinancesComponent implements OnInit {
  segmentTitle = 'Ordinance';
  segment = 'ordinances';
  ordinances: any = [];
  authors: any = [];
  statuses: any = [
    { id: '', name: 'All' },
    { id: 'approved', name: 'Approved' },
    { id: 'pending', name: 'Pending' },
  ];

  params = {
    take: 10,
    offset: 0,
    q: '',
    filter: '',
    ref: 'author',
    f: 'number,status,approved_date,title',
    author_id: '',
    order_by: '',
    order_field: '',
  };

  isAsc = false;
  paginator: any;
  searchModelChanged: Subject<string> = new Subject<string>();

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
    private activeRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.activeRoute.queryParams.subscribe((params) => {
      this.params.author_id = params.id || '';
    });

    this.user$ = this.authService.me();
    this.getMembers();
    this.get();

    this.searchModelChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((newInput) => {
        this.params.q = newInput;
        this.params.offset = 0;
        this.get();
      });
  }

  get(): void {
    this.ordinances = [];
    this.httpService.get(this.segment, this.params).subscribe(
      (data: any) => {
        if (!data.error) {
          if (data.results_count) {
            this.ordinances = data.results;
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

  getMembers() {
    this.httpService.get('members', { f: 'id,firstname,lastname' }).subscribe(
      (data: any) => {
        if (!data.error) {
          this.authors = data.results.map((member) => ({
              id: member.id,
              name: `${member.firstname} ${member.lastname}`,
            }));
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

  async openDialog(id = -1, action = 'create') {
    const itemData: any = {
      title: `Create New ${this.segmentTitle}`,
      action,
      segment: this.segment,
    };

    if (id !== -1) {
      await firstValueFrom(
        this.httpService.show(this.segment, id)
      ).then((data: any) => {
          if (!data.error) {
            if (data.results_count) {
              const res = data.results;

              const newCommittees = res.committees.map((committee) => committee.committee_id);

              const newCoAuthors = res.co_authors.map((author) => author.member_id);

              const newCoSponsors = res.co_sponsors.map((sponsor) => sponsor.member_id);

              itemData.id = res.number;
              itemData.title =
                action === 'view'
                  ? `${this.segmentTitle} Info`
                  : `${action} ${this.segmentTitle}`;

              itemData.files =
                res.files.length > 0
                  ? res.files.map((file) => ({
                        title: file.title,
                        file: file.filename,
                        filename: file.filename,
                        type: file.type,
                      }))
                  : [];

              itemData.formData = {
                number: res.number,
                title: res.title,
                committee_report_number: res.committee_report_number,
                committees: newCommittees,
                author_id: res.author_id,
                co_authors: newCoAuthors,
                co_sponsors: newCoSponsors,
                remarks: res.remarks,
                source: res.source,
                ammended_date: this.textService.formatDefaultDate(
                  res.ammended_date
                ),
                committee_hearing_date: this.textService.formatDefaultDate(
                  res.committee_hearing_date
                ),
                first_reading_date: this.textService.formatDefaultDate(
                  res.first_reading_date
                ),
                repealed_date: this.textService.formatDefaultDate(
                  res.repealed_date
                ),
                second_reading_date: this.textService.formatDefaultDate(
                  res.second_reading_date
                ),
                third_reading_date: this.textService.formatDefaultDate(
                  res.third_reading_date
                ),
                approved_date: moment(res.approved_date).format('YYYY-MM-DD'),
                effectivity_date: moment(res.effectivity_date).format(
                  'YYYY-MM-DD'
                ),
                publication_date: moment(res.publication_date).format(
                  'YYYY-MM-DD'
                ),
              };

              this.showDialog(itemData);
            } else {
              this.snackBarService.errorMessage(
                this.constant.errConst.noResultsFound
              );
            }
          } else {
            if (data.form_errors && data.form_errors.length) {
              data.form_errors.forEach((error) => {
                this.snackBarService.errorMessage(error.message);
              });
            } else {
              this.snackBarService.errorMessage(data.msg);
            }
          }
        });
    } else {
      this.showDialog(itemData);
    }
  }

  showDialog(data): void {
    const dialogRef = this.dialog.open(OrdinanceModalComponent, {
      data: { ...data },
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
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {this.get();}
      });
    }
  }

  syncData(): void {
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
