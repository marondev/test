/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// MATERIAL
import { MatDialog } from '@angular/material/dialog';

// COMPONENTS
import { ConfirmComponent, ItemComponent, ItemData } from '@shared/modals';
import { MembersModalComponent } from '@app/members/members-modal/members-modal.component';

// SERVICES
import { HttpService, SnackBarService } from '@core/services';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-members-info',
  templateUrl: './members-info.component.html',
  styleUrls: ['./members-info.component.css'],
})
export class MembersInfoComponent implements OnInit {
  segment = 'members';
  id = null;
  user: any = {};

  month = [
    { id: 'Jan', name: 'Jan' },
    { id: 'Feb', name: 'Feb' },
    { id: 'Mar', name: 'Mar' },
    { id: 'Apr', name: 'Apr' },
    { id: 'May', name: 'May' },
    { id: 'Jun', name: 'Jun' },
    { id: 'Jul', name: 'Jul' },
    { id: 'Aug', name: 'Aug' },
    { id: 'Sep', name: 'Sep' },
    { id: 'Oct', name: 'Oct' },
    { id: 'Nov', name: 'Nov' },
    { id: 'Dec', name: 'Dec' },
  ];
  year = [];

  constructor(
    private httpService: HttpService,
    private snackBarService: SnackBarService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.id = this.activeRoute.snapshot.params.id;
    this.getYear();
  }

  ngOnInit(): void {
    this.get();
  }

  getYear() {
    this.year = [];
    const currentYear = new Date().getFullYear();
    for (let i = 1900; i <= currentYear; i++) {
      this.year.push({ id: i, name: i });
    }
    this.year.reverse();
  }

  async get() {
    await firstValueFrom(
      this.httpService.show(this.segment, this.id)
      ).then(
        (data: any) => {
          if (!data.error) {
            if (data.results_count) {
              this.user = data.results;

              if (this.user.educations) {
                 this.user.educations.map((education) => {
                  education.date =
                    !education.start_date && !education.end_date
                      ? null
                      : education.start_date + ' - ' + education.end_date;
                });
              }

              if (this.user.experiences) {
                 this.user.experiences.map((experience) => {
                  if (!experience.start_date && !experience.end_date) {
                    experience.date = null;
                  } else {
                    experience.date =
                      experience.start_date + ' - ' + experience.end_date;
                  }
                });
              }

              if (this.user.avatar) {
                const byteArray = new Uint8Array(this.user.avatar.data);
                this.user.pic = new Blob([byteArray], { type: 'image/png' });
              }

              if (this.user.ordinances.length) {
                this.user.ordinances = this.user.ordinances.slice(0, 5);
              }

              if (this.user.resolutions.length) {
                this.user.resolutions = this.user.resolutions.slice(0, 5);
              }

              if (this.user.sessions.length) {
                this.user.sessions = this.user.sessions.slice(0, 5);
              }

              if (this.user.committee_reports.length) {
                this.user.committee_reports = this.user.committee_reports.slice(
                  0,
                  5
                );
              }
            }
          }
        },
        (error) => {
          this.snackBarService.errorMessage(error);
        }
      );
  }

  back(): void {
    this.activeRoute.queryParams.subscribe((params) => {
      this.router.navigate([
        params.ref === 'dashboard' ? '/dashboard' : '/members',
      ]);
    });
  }

  confirmDialog(): void {
    if (this.id) {
      const dialogRef = this.dialog.open(ConfirmComponent, {
        data: { segment: this.segment, id: this.id },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {this.back();}
      });
    }
  }

  editProfile(): void {
    const {
      id,
      firstname,
      middlename,
      lastname,
      suffix,
      pic,
      is_current,
      committees,
    } = this.user;

    const newCommittees = committees.map((data) => data.committee.id);

    const dialogRef = this.dialog.open(MembersModalComponent, {
      width: '500px',
      data: {
        action: 'update',
        title: 'Update Member',
        result: {
          id,
          firstname,
          middlename,
          lastname,
          suffix,
          pic,
          is_current,
          committees: newCommittees,
        },
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {this.get();}
    });
  }

  getExperienceInputs() {
    return [
      { name: 'title', placeholder: 'Title', required: true, type: 'text' },
      { name: 'company', placeholder: 'Company', required: true, type: 'text' },
      { name: 'description', placeholder: 'Description', type: 'text' },
      {
        name: 'location',
        placeholder: 'Location',
        required: true,
        type: 'text',
      },
      {
        name: 'start_month',
        placeholder: 'Start Date Month',
        type: 'select',
        optionSelect: this.month,
        class: 'col-6',
      },
      {
        name: 'start_year',
        placeholder: 'Start Date Year',
        type: 'select',
        optionSelect: this.year,
        class: 'col-6',
      },
      {
        name: 'end_month',
        placeholder: 'End Date Month',
        type: 'select',
        optionSelect: this.month,
        class: 'col-6',
      },
      {
        name: 'end_year',
        placeholder: 'End Date Year',
        type: 'select',
        optionSelect: this.year,
        class: 'col-6',
      },
    ];
  }

  getAwardInputs() {
    return [
      { name: 'title', placeholder: 'Title', required: true, type: 'text' },
      { name: 'description', placeholder: 'Description', type: 'text' },
      {
        name: 'association',
        placeholder: 'Association',
        required: true,
        type: 'text',
      },
      {
        name: 'month',
        placeholder: 'Month',
        type: 'select',
        optionSelect: this.month,
        class: 'col-6',
      },
      {
        name: 'year',
        placeholder: 'Year',
        type: 'select',
        optionSelect: this.year,
        class: 'col-6',
      },
    ];
  }

  getProjectInputs() {
    return [
      { name: 'name', placeholder: 'Name', required: true, type: 'text' },
      {
        name: 'description',
        placeholder: 'Description',
        required: true,
        type: 'text',
      },
      {
        name: 'month',
        placeholder: 'Month',
        type: 'select',
        optionSelect: this.month,
        class: 'col-6',
      },
      {
        name: 'year',
        placeholder: 'Year',
        type: 'select',
        optionSelect: this.year,
        class: 'col-6',
      },
    ];
  }

  getEducationInputs() {
    return [
      { name: 'school', placeholder: 'School', required: true, type: 'text' },
      { name: 'degree', placeholder: 'Degree', required: true, type: 'text' },
      {
        name: 'start_month',
        placeholder: 'Start Date Month',
        type: 'select',
        optionSelect: this.month,
        class: 'col-6',
      },
      {
        name: 'start_year',
        placeholder: 'Start Date Year',
        type: 'select',
        optionSelect: this.year,
        class: 'col-6',
      },
      {
        name: 'end_month',
        placeholder: 'End Date Month',
        type: 'select',
        optionSelect: this.month,
        class: 'col-6',
      },
      {
        name: 'end_year',
        placeholder: 'End Date Year',
        type: 'select',
        optionSelect: this.year,
        class: 'col-6',
      },
    ];
  }

  openDialog(segment, action = 'create'): void {
    let inputs = [];
    if (segment === 'experience') {
      inputs = this.getExperienceInputs();
    } else if (segment === 'award') {
      inputs = this.getAwardInputs();
    } else if (segment === 'project') {
      inputs = this.getProjectInputs();
    } else if (segment === 'education') {
      inputs = this.getEducationInputs();
    } else {
      this.snackBarService.errorMessage('An error occurred.');
      return;
    }

    const itemData = {
      title: `Create New ${segment}`,
      inputs,
      action,
      hasFile: false,
      segment: `members-${segment}s`,
      files: null,
      id: this.id,
    } as ItemData;

    const dialogRef = this.dialog.open(ItemComponent, {
      data: itemData,
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {this.get();}
    });
  }
}
