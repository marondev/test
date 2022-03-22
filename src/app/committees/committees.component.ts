import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { firstValueFrom, Subject } from 'rxjs';

// MATERIAL
import { MatDialog } from '@angular/material/dialog';

// COMPONENTS
import { ItemComponent, ItemData, ConfirmComponent } from '@shared/modals';

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

@Component({
  selector: 'app-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.css']
})
export class CommitteesComponent implements OnInit {
  segmentTitle = 'Committee';
  segment = 'committees';
  items: FormData[] = [];
  committees: any = [];
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
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((newInput) => {
        this.params.q = newInput;
        this.params.offset = 0;
        this.get();
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

  get(): void {
    this.httpService.get(this.segment, this.params).subscribe(
      (data: any) => {
        if ( !data.error ) {
          if (data.results_count) {
            this.committees = data.results;
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

  async show(docId: string) {
    return await firstValueFrom (
        this.httpService.show(this.segment, docId)
      ).then(
        async (data: any) => {
          if (!data.error) {
            if (data.results_count) {
              const {
                id,
                name
              } = data.results;

              return {
                error: false,
                msg: '',
                results: {
                  id,
                  name
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

  openDialog( docId: any = -1, action = 'create' ): void {
    const itemData = {
      title: `Create New ${this.segmentTitle}`,
      inputs: [
        { name: 'name', placeholder: 'Committee', required: true, type: 'text' },
      ],
      action,
      segment: this.segment,
      hasFile: false
    } as ItemData;

    if (docId !== -1) {
      this.show(docId).then((data) => {
        if (data.error) {
          this.snackBarService.errorMessage(data.msg);
          return;
        }

        const {
          id,
          name,
        } = data.results;

        itemData.id = id;
        itemData.title = action === 'view' ?  `${this.segmentTitle} Info` :`${action} ${this.segmentTitle}`;
        itemData.inputs = [
          { name: 'name', placeholder: 'Committee', required: true, type: 'text', value: name },
        ];
      });
    }

    const dialogRef = this.dialog.open(ItemComponent, {
      data: itemData,
      width: '500px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {this.get();}
    });
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
