import { Component, OnInit } from "@angular/core";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

// MATERIAL
import { MatDialog } from "@angular/material/dialog";

// COMPONENT
import { MembersModalComponent } from "@app/members/members-modal/members-modal.component";

// SERVICES
import {
  HttpService,
  SnackBarService,
  SyncService,
  LoadingService,
} from "@core/services";

// CONSTANT
import * as constant from '@core/data/constant';

@Component({
  selector: "app-members-view",
  templateUrl: "./members-view.component.html",
  styleUrls: ["./members-view.component.css"],
})
export class MembersViewComponent implements OnInit {
  segment = 'members';
  allMembers: any = [];
  currentMembers: any = [];
  pastMembers: any = [];
  params = {
    take: 20,
    offset: 0,
    q: "",
  };
  status = '';
  searchModelChanged: Subject<string> = new Subject<string>();

  isFetching: boolean = true;
  constant: any = constant;
  isSyncing: boolean;

  constructor(
    private dialog: MatDialog,
    private httpService: HttpService,
    private snackBarService: SnackBarService,
    private syncService: SyncService,
    private loadingService: LoadingService,
  ) {}

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
    this.isFetching = true;
    this.allMembers = [];
    this.currentMembers = [];
    this.pastMembers = [];
    this.httpService.get(this.segment, this.params).subscribe(
      (data: any) => {
        this.isFetching = false;
        if (!data.error) {
          if (data.results_count) {
            data.results.map((member) => {
              member.name =
                (member.firstname ? member.firstname + " " : "") +
                (member.middlename ? member.middlename + " " : "") +
                (member.lastname ? member.lastname + " " : "") +
                (member.suffix ? member.suffix + " " : "").trim();

              if (member.avatar !== null) {
                const byteArray = new Uint8Array(member.avatar.data);
                member.avatar = new Blob([byteArray], { type: "image/png" });
              }

              if (member.is_current) {
                this.currentMembers.push(member);
              } else {
                this.pastMembers.push(member);
              }
            });

            this.allMembers = !this.status ? [...this.currentMembers] : [...this.pastMembers];
          }
        } else {
          if (data.form_errors && data.form_errors.length) {
            let errMsg = [];
            data.form_errors.forEach((error) => {
              errMsg.push(error.message);
            });
            this.snackBarService.errorMessage(errMsg.join("\n"));
          } else {
            this.snackBarService.errorMessage(data.msg);
          }
        }
      },
      (error) => {
        this.isFetching = false;
        this.snackBarService.errorMessage(error);
      }
    );
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(MembersModalComponent, {
      data: {
        action: 'create',
        title: 'Create Member',
      },
      width: constant.defaultConst.entryModalWidthSmall,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.get();
    });
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
