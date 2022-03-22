import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { firstValueFrom, Subject } from 'rxjs';

// MATERIAL
import { MatDialog } from '@angular/material/dialog';

// COMPONENTS
import { UserModalComponent } from './user-modal/user-modal.component';
import { ConfirmComponent, FileComponent } from '@shared/modals';

// SERVICES
import {
  HttpService,
  SnackBarService,
  PaginatorService,
  SyncService,
  LoadingService,
} from '@core/services';

// CONSTANT
import * as constant from '@core/data/constant';

interface ItemData {
  id?: number;
  segment: string;
  action: string;
  title: string;
  result: object;
}


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  segmentTitle = 'Editor';
  segment = 'users';
  users: any = [];
  params = {
    take: 10,
    offset: 0,
    q: '',
    filter: null,
    ref: '',
    f: ''
  };

  paginator: any;
  searchModelChanged: Subject<string> = new Subject<string>();

  constant: any = constant;
  isSyncing: boolean;

  constructor(
    private dialog: MatDialog,
    private httpService: HttpService,
    private snackBarService: SnackBarService,
    private paginatorService: PaginatorService,
    private syncService: SyncService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    this.get();

    this.searchModelChanged
      .pipe(
        debounceTime( 500 ),
        distinctUntilChanged()
      )
      .subscribe( newInput => {
        this.params.q = newInput;
        this.params.offset = 0;
        this.get();
      });
  }

  get(): void {
    this.users = [];
    this.httpService.get(this.segment, this.params).subscribe(
      (data: any) => {
        if ( !data.error ) {
          if (data.results_count) {
            this.users = data.results;
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

  async show(docId) {
    return await firstValueFrom(
        this.httpService.show(this.segment, docId)
      ).then(
        async (data: any) => {
          if (!data.error) {
            if (data.results_count) {
              const {
                id,
                username,
                fullname,
                avatar
              } = data.results;

              return {
                error: false,
                msg: '',
                results: {
                  id,
                  username,
                  fullname,
                  avatar
                },
              };
            } else {
              return {
                error: true,
                msg: 'Unable to find record or already been deleted.',
                results: null,
              };
            }
          } else {
            return {
              error: true,
              msg: 'An error occurred.',
              results: null,
            };
          }
        },
        (error) => ({
            error: true,
            msg: error,
            results: null,
          })
      );
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
    const formData = {
      title: action === 'view' ?  `${this.segmentTitle} Info` : `${action} ${this.segmentTitle}`,
      segment: this.segment,
      action
    } as ItemData;

    if (id !== -1) {
      await this.show(id).then((data) => {
        if (data.error) {
          this.snackBarService.errorMessage(data.msg);
          return;
        }
        formData.result = data.results;
      });
    }

    const dialogRef = this.dialog.open(UserModalComponent, {
      data: formData,
      width: '500px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {this.get();}
    });
  }

  fileDialog( id ): void {
    if ( id ) {
      this.dialog.open(FileComponent, {
        data: {id, segment: this.segment},
        width: '100%',
        height: '90vh',
        disableClose: true
      });
    }
  }

  confirmDialog( id ): void {
    if ( id ) {
      const dialogRef = this.dialog.open(ConfirmComponent, {
        data: { segment: this.segment , id },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if ( result ) {this.get();}
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

