import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// MAIN MODULE
import { AdminRoutingModule } from './admin-routing.module';

// CORE MODULE
import { CoreModule } from '@core/core.module';

// COMPONENTS
import { DashboardComponent } from '@app/dashboard/dashboard.component';
import { OrdinancesComponent } from '@app/ordinances/ordinances.component';
import { OrdinanceModalComponent } from '@app/ordinances/ordinance-modal/ordinance-modal.component';
import { ResolutionsComponent } from '@app/resolutions/resolutions.component';
import { ResolutionModalComponent } from '@app/resolutions/resolution-modal/resolution-modal.component';
import { SessionsComponent } from '@app/sessions/sessions.component';
import { SessionsModalComponent } from '@app/sessions/sessions-modal/sessions-modal.component';
import { CommitteeReportsComponent } from '@app/committee-reports/committee-reports.component';
import { CommitteeReportsModalComponent } from '@app/committee-reports/committee-reports-modal/committee-reports-modal.component';
import { PrivilegeSpeechesComponent } from '@app/privilege-speeches/privilege-speeches.component';
import { VehicleFranchiseComponent } from '@app/vehicle-franchise/vehicle-franchise.component';
import { NgoAccreditationComponent } from '@app/ngo-accreditation/ngo-accreditation.component';
import { SubdivisionsComponent } from '@app/subdivisions/subdivisions.component';
import { OthersComponent } from '@app/others/others.component';
import { MemorandaComponent } from '@app/memoranda/memoranda.component';
import { MembersComponent } from '@app/members/members.component';
import { MembersViewComponent } from '@app/members/members-view/members-view.component';
import { MembersInfoComponent } from '@app/members/members-info/members-info.component';
import { MembersModalComponent } from '@app/members/members-modal/members-modal.component';
import { ReferencesComponent } from '@app/references/references.component';
import { CommitteesComponent } from '@app/committees/committees.component';
import { SettingsComponent } from '@app/settings/settings.component';
import { AccountComponent } from '@app/account/account.component';
import { BackupRestoreComponent } from '@app/backup-restore/backup-restore.component';
import { UsersComponent } from '@app/users/users.component';
import { UserModalComponent } from '@app/users/user-modal/user-modal.component';
import { LogsComponent } from '@app/logs/logs.component';

// SHARED COMPONENTS
import { ItemComponent, ConfirmComponent, FileComponent } from '@shared/modals';

// MATERIAL MODULES
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';

// OTHER MODULES
import { FileUploadModule } from 'ng2-file-upload';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MomentModule } from 'ngx-moment';

// DIRECTIVES
import { DirectivesModule } from '@app/shared/directives/directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AdminRoutingModule,
    MomentModule,
    DirectivesModule,
    NgxExtendedPdfViewerModule,
    FileUploadModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatCheckboxModule,
    CoreModule
  ],
  declarations: [
    DashboardComponent,
    OrdinancesComponent,
    OrdinanceModalComponent,
    ResolutionsComponent,
    ResolutionModalComponent,
    SessionsComponent,
    SessionsModalComponent,
    CommitteeReportsComponent,
    CommitteeReportsModalComponent,
    PrivilegeSpeechesComponent,
    VehicleFranchiseComponent,
    NgoAccreditationComponent,
    SubdivisionsComponent,
    OthersComponent,
    MemorandaComponent,
    MembersComponent,
    MembersViewComponent,
    MembersInfoComponent,
    MembersModalComponent,
    ReferencesComponent,
    CommitteesComponent,
    SettingsComponent,
    AccountComponent,
    BackupRestoreComponent,
    MemorandaComponent,
    UserModalComponent,
    UsersComponent,
    LogsComponent,
    ItemComponent,
    ConfirmComponent,
    FileComponent,
  ],
  entryComponents: [ItemComponent, ConfirmComponent, FileComponent],
})
export class AdminModule { }
