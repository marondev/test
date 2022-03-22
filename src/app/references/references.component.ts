import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

// MATERIAL
import { MatDialog } from '@angular/material/dialog';

// COMPONENTS
import {
  ItemData,
  ItemComponent,
  FileComponent,
  ConfirmComponent
} from '@shared/modals';

// SERVICES
import {
  HttpService,
  SnackBarService,
  PaginatorService,
  SyncService,
  LoadingService,
  AuthService,
  User,
} from '@core/services';

// CONSTANT
import * as constant from '@core/data/constant';

@Component({
  selector: 'app-references',
  templateUrl: './references.component.html',
  styleUrls: ['./references.component.css'],
})
export class ReferencesComponent implements OnInit {
  segment = 'references';
  segmentTitle = 'Reference';
  files: any = [];
  references: any = [];
  currentFile: any;
  params = {
    take: 10,
    offset: 0,
    q: '',
    filter: '',
    ref: 'author',
    f: 'id,title',
  };

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
    this.references = [];
    this.httpService.get(this.segment, this.params).subscribe((data: any) => {
      if (!data.error) {
        if (data.results_count) {
          this.references = data.results;
          this.paginator = this.paginatorService.paginate(
            data.total_count,
            this.params.take,
            this.params.offset,
            5
          );
        }
      }
    });
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

  openDialog(action = 'create'): void {
    const dialogRef = this.dialog.open(ItemComponent, {
      data: {
        action,
        title: `Create New ${this.segmentTitle}`,
        hasFile: true,
        segment: this.segment
      } as ItemData,
      width: '500px',
      disableClose: true
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
    } else {
      this.snackBarService.errorMessage('An error occurred.');
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
