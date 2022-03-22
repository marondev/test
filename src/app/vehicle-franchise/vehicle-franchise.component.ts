/* eslint-disable id-blacklist */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { firstValueFrom, Observable, Subject } from 'rxjs';

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
  User
} from '@core/services';

// CONSTANT
import * as constant from '@core/data/constant';

@Component({
  selector: 'app-vehicle-franchise',
  templateUrl: './vehicle-franchise.component.html',
  styleUrls: ['./vehicle-franchise.component.css'],
})
export class VehicleFranchiseComponent implements OnInit {
  segmentTitle = 'Vehicle Franchise';
  segment = 'vehicle-franchises';
  vehicleFranchises: any = [];
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
  vehicleType = [
    { id: 1, name: 'Cars, Taxi, Jeepney, Vans, Motorcycles (400cc and above)' },
    { id: 2, name: 'Light Trucks, Bus' },
    { id: 3, name: 'Multi-Axled Trucks' },
  ];
  statuses = [
    { id: '', name: 'All' },
    { id: 1, name: 'Class 1' },
    { id: 2, name: 'Class 2' },
    { id: 3, name: 'Class 3' },
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
    this.vehicleFranchises = [];
    this.httpService.get(this.segment, this.params).subscribe(
      (data: any) => {
        if (!data.error) {
          if (data.results_count) {
            this.vehicleFranchises = data.results;
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

  async show(id) {
    return await firstValueFrom(
        this.httpService.show(this.segment, id)
      ).then(
        async (data: any) => {
          if (!data.error) {
            if (data.results_count) {
              const {
                number,
                date,
                plate_number,
                owner,
                type,
                description,
                files,
              } = data.results;

              return {
                error: false,
                msg: '',
                results: {
                  number,
                  date,
                  plate_number,
                  owner,
                  type,
                  description,
                  files,
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

  async openDialog(id = -1, action = 'create') {
    const itemData = {
      title: `Create New ${this.segmentTitle}`,
      inputs: [
        {
          name: 'number',
          placeholder: 'Franchise Number',
          required: true,
          type: 'text',
        },
        {
          name: 'date',
          placeholder: 'Date Issued',
          required: true,
          type: 'date',
        },
        {
          name: 'plate_number',
          placeholder: 'Plate Number',
          required: true,
          type: 'text',
        },
        { name: 'owner', placeholder: 'Owner', required: true, type: 'text' },
        {
          name: 'type',
          placeholder: 'Vehicle Type',
          required: true,
          type: 'select',
          optionSelect: this.vehicleType,
        },
        { name: 'description', placeholder: 'Description', type: 'textarea' },
      ],
      action,
      hasFile: true,
      segment: this.segment,
    } as ItemData;

    if (id !== -1) {
      await this.show(id).then((data) => {
        if (data.error) {
          this.snackBarService.errorMessage(data.msg);
          return;
        }

        const {
          number,
          date,
          plate_number,
          owner,
          type,
          description,
          files,
        } = data.results;

        const new_date = this.textService.formatDefaultDate(date);

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
            name: 'number',
            placeholder: 'Franchise Number',
            required: true,
            type: 'text',
            value: number,
          },
          {
            name: 'date',
            placeholder: 'Date Issued',
            required: true,
            type: 'date',
            value: new_date,
          },
          {
            name: 'plate_number',
            placeholder: 'Plate Number',
            required: true,
            type: 'text',
            value: plate_number,
          },
          {
            name: 'owner',
            placeholder: 'Owner',
            required: true,
            type: 'text',
            value: owner,
          },
          {
            name: 'type',
            placeholder: 'Vehicle Type',
            required: true,
            type: 'select',
            optionSelect: this.vehicleType,
            value: parseInt(type, 10),
          },
          {
            name: 'description',
            placeholder: 'Description',
            type: 'textarea',
            value: description,
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
