/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { take } from 'rxjs/operators';

// SERVICES
import { HttpService, SnackBarService, AuthService, TextService } from '@core/services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  ordinanceCount: number;
  resolutionCount: number;
  session: any = {};

  currentFile: any = null;
  sessionFiles: any;
  isLoaded = false;

  isPDF = false;

  constructor(
    private httpService: HttpService,
    private snackBarService: SnackBarService,
    private authService: AuthService,
    private textService: TextService,
  ) {}

  ngOnInit(): void {
    this.getOrdinanceCount();
    this.getResolutionCount();
    this.getSession();
  }

  getOrdinanceCount(): void {
    this.ordinanceCount = 0;
    this.httpService.get('ordinances/count', {}).subscribe((data: any) => {
      if (!data.error) {
        if (data.results) {this.ordinanceCount = data.results;}
      }
    });
  }

  getResolutionCount(): void {
    this.resolutionCount = 0;
    this.httpService.get('resolutions/count', {}).subscribe((data: any) => {
      if (!data.error) {
        if (data.results) {this.resolutionCount = data.results;}
      }
    });
  }

  getSession(): void {
    const params = {
      take: 1,
      offset: 0,
      q: '',
      filter: '',
      ref: 'files,members',
      date: formatDate(new Date(), 'yyyyLLdd', 'en'),
      f: 'number,date,description,type',
      order_by: 'ASC',
      order_field: 'date'
    };

    this.httpService.get('sessions', params).subscribe((data: any) => {
      if (!data.error) {
        this.session = data.results[0];

        console.log(this.session);

        if (this.session) {
          this.session.date = this.textService.formatDefaultDate(this.session.date);
          this.sessionFiles = this.session.files[0];
          if (this.sessionFiles) {
            const type = this.sessionFiles.type;
            const fileExtension = type.substring(type.lastIndexOf('/') + 1);
            this.isPDF = fileExtension === 'pdf';
            const byteArray = new Uint8Array(this.sessionFiles.file.data);
            this.currentFile = new Blob([byteArray], {
              type,
            });
          }

          if (this.session.date) {
            this.httpService
              .show('sessions', this.session.date)
              .subscribe((sessionData: any) => {
                console.log(sessionData);
                if (!sessionData.error) {
                  this.session.members = sessionData.results.members.map((member) => ({
                      id: member.member_id,
                      name: `${
                        member.info?.firstname ? member.info.firstname : ''
                      } ${
                        member.info?.middlename ? member.info.middlename : ''
                      } ${member.info?.lastname ? member.info.lastname : ''} ${
                        member.info?.suffix ? member.info.suffix : ''
                      }`.trim(),
                    }));
                }
              });
          }
        }
      }
    });
  }

  log(action: any): void {
    this.authService
      .me()
      .pipe(take(1))
      .subscribe((user) => {
        const data = {
          user_id: user.id,
          entity_id: this.sessionFiles.number,
          action,
          entity: 'sessions',
          description: `${user.fullname} - ${action} ${this.sessionFiles.filename}`,
        };
        this.httpService.store('logs', data).subscribe((e) => {
            if (!e.error) {this.snackBarService.successMessage(e.msg);}
            else {
              this.snackBarService.errorMessage(e.msg);
            }
          },
          (error) => {
            console.log(error);
          }
        );
      });
  }
}
