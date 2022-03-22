/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import * as moment from 'moment';

// MATERIAL
import { MatDialog } from '@angular/material/dialog';

// COMPONENTS
import {
  ItemComponent,
  ItemData,
  ConfirmComponent,
  FileComponent,
} from '@shared/modals';

// SERVICES
import {
  HttpService,
  SnackBarService,
  PaginatorService,
  TextService,
  SyncService,
  LoadingService,
  AuthService,
  User,
} from '@core/services';

// CONSTANT
import * as constant from '@core/data/constant';

@Component({
  selector: 'app-memoranda',
  templateUrl: './memoranda.component.html',
  styleUrls: ['./memoranda.component.css'],
})
export class MemorandaComponent implements OnInit {
  segmentTitle = 'Memoranda';
  segment = 'memoranda';
  memoranda: any = [];
  params = {
    take: 10,
    offset: 0,
    q: '',
    filter: null,
    ref: '',
    f: '',
    order_by: '',
    order_field: '',
  };
  types = [
    { id: 1, name: 'MOA' },
    { id: 2, name: 'MOU' },
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
    this.memoranda = [];
    this.httpService.get(this.segment, this.params).subscribe(
      (data: any) => {
        if (!data.error) {
          if (data.results_count) {
            this.memoranda = data.results;
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
    return await firstValueFrom(
      this.httpService.show(this.segment, docId)
    ).then(
        async (data: any) => {
          if (!data.error) {
            if (data.results_count) {
              const {
                id,
                approved_date,
                executed_date,
                first_party,
                second_party,
                other_party,
                description,
                files,
                type,
              } = data.results;

              return {
                error: false,
                msg: '',
                results: {
                  id,
                  approved_date,
                  executed_date,
                  first_party,
                  second_party,
                  other_party,
                  description,
                  files,
                  type,
                },
              };
            } else {
              return {
                error: true,
                msg: constant.errConst.unableToFind,
                results: null,
              };
            }
          } else {
            return {
              error: true,
              msg: constant.errConst.errorOccurred,
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

  async openDialog(docId: any = -1, action = 'create') {
    const itemData = {
      title: `Create New ${this.segmentTitle}`,
      inputs: [
        {
          name: 'approved_date',
          placeholder: 'Date Approved',
          required: true,
          type: 'date',
        },
        {
          name: 'executed_date',
          placeholder: 'Date Executed',
          required: true,
          type: 'date',
        },
        {
          name: 'type',
          placeholder: 'Type',
          type: 'select',
          required: true,
          optionSelect: this.types,
        },
        { name: 'description', placeholder: 'Description', type: 'text' },
        {
          name: 'first_party',
          placeholder: 'First Party',
          required: true,
          type: 'text',
        },
        {
          name: 'second_party',
          placeholder: 'Second Party',
          required: true,
          type: 'text',
        },
        { name: 'other_party', placeholder: 'Others', type: 'text' },
      ],
      action,
      hasFile: true,
      segment: this.segment,
      files: null,
    } as ItemData;

    if (docId !== -1) {
      await this.show(docId).then((data) => {
        if (data.error) {
          this.snackBarService.errorMessage(data.msg);
          return;
        }

        const {
          id,
          approved_date,
          executed_date,
          first_party,
          second_party,
          other_party,
          description,
          files,
          type,
        } = data.results;

        const new_approved_date = this.textService.formatDefaultDate(
          approved_date
        );
        const new_executed_date = moment(executed_date).format('YYYY-MM-DD');

        itemData.id = id;
        itemData.title =
          action === 'view'
            ? `${this.segmentTitle} Info`
            : `${action} ${this.segmentTitle}`;

        itemData.files =
          files.length > 0
            ? files.map((file) => ({
                  title: file.title,
                  file: file.filename,
                  filename: file.filename,
                  type: file.type,
                }))
            : [];

        itemData.inputs = [
          {
            name: 'approved_date',
            placeholder: 'Date Approved',
            required: true,
            type: 'date',
            value: new_approved_date,
          },
          {
            name: 'executed_date',
            placeholder: 'Date Executed',
            required: true,
            type: 'date',
            value: new_executed_date,
          },
          {
            name: 'type',
            placeholder: 'Type',
            type: 'select',
            required: true,
            optionSelect: this.types,
            value: parseInt(type, 10),
          },
          {
            name: 'description',
            placeholder: 'Description',
            type: 'text',
            value: description,
          },
          {
            name: 'first_party',
            placeholder: 'First Party',
            required: true,
            type: 'text',
            value: first_party,
          },
          {
            name: 'second_party',
            placeholder: 'Second Party',
            required: true,
            type: 'text',
            value: second_party,
          },
          {
            name: 'other_party',
            placeholder: 'Others',
            type: 'text',
            value: other_party,
          },
        ];
      });
    }

    const dialogRef = this.dialog.open(ItemComponent, {
      data: itemData,
      width: constant.defaultConst.entryModalWidth,
      disableClose: itemData.action !== 'view' ? true : false,
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
