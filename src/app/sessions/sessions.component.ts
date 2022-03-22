/* eslint-disable id-blacklist */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { firstValueFrom, Observable, Subject } from 'rxjs';

// MATERIAL
import { MatDialog } from '@angular/material/dialog';

// COMPONENTS
import { ConfirmComponent, FileComponent } from '@shared/modals';
import { SessionsModalComponent } from '@app/sessions/sessions-modal/sessions-modal.component';

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
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss'],
})
export class SessionsComponent implements OnInit {
  segmentTitle = 'Session';
  segment = 'sessions';
  sessions: any = [];
  items: FormData[] = [];
  params = {
    take: 10,
    offset: 0,
    q: '',
    filter: '',
    ref: 'notes',
    f: 'number,date,description,type',
    order_by: '',
    order_field: '',
  };
  statuses = [
    { id: '', name: 'All' },
    { id: 'regular', name: 'Regular' },
    { id: 'special', name: 'Special' },
  ];

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
    this.httpService.get(this.segment, this.params).subscribe(
      (data: any) => {
        if (!data.error) {
          this.sessions = data.results;
          if (data.results_count) {
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
              const members = res.members.map((member) => member.member_id);

              itemData.id = res.date;
              itemData.title =
                action === 'view'
                  ? `${this.segmentTitle} Info`
                  : `${action} ${this.segmentTitle}`;

              itemData.files = [];

              const note = res.notes.length > 0 ? res.notes[0].note : '';

              itemData.formData = {
                number: res.number,
                type: res.type,
                date: this.textService.formatDefaultDate(res.date),
                members,
                description: res.description,
                note
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
    const dialogRef = this.dialog.open(SessionsModalComponent, {
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

  sync(): void {
    this.isSyncing = true;
    this.loadingService.loadingEmit(this.isSyncing);
    this.syncService
      .sync(this.segment)
      .then((res: any) => {

        if (!res.error) {
          if (res.result) {
            this.snackBarService.successMessage(res.message);
            this.get();
          } else {
            this.snackBarService.infoMessage(res.message);
          }
        } else {
          this.snackBarService.errorMessage(res.message);
        }
        this.isSyncing = false;
        this.loadingService.loadingEmit(this.isSyncing);
      })
      .catch((e) => {
        this.snackBarService.infoMessage(constant.errConst.errorOccurred);
        this.isSyncing = false;
        this.loadingService.loadingEmit(this.isSyncing);
      });
  }
}
