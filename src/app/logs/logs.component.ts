/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';

// SERVICES
import { HttpService } from '@app/core/services/http/http.service';
import { SnackBarService } from '@app/core/services/snack-bar/snack-bar.service';
import { PaginatorService } from '@app/core/services/paginator/paginator.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  segment = 'logs';
  logs: any = [];
  params = {
    take: 10,
    offset: 0,
    order_by: '',
    order_field: ''
  };
  paginator: any;

  constructor(
    private httpService: HttpService,
    private snackBarService: SnackBarService,
    private paginatorService: PaginatorService
  ) { }

  ngOnInit(): void {
    this.get();
  }

  get(): void {
    this.logs = [];
    this.httpService.get(this.segment, this.params).subscribe(
      (data: any) => {
        if ( !data.error ) {
          if (data.results_count) {
            this.logs = data.results;
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
}
