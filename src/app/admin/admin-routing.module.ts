import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTS
import { DashboardComponent } from '@app/dashboard/dashboard.component';
import { OrdinancesComponent } from '@app/ordinances/ordinances.component';
import { ResolutionsComponent } from '@app/resolutions/resolutions.component';
import { SessionsComponent } from '@app/sessions/sessions.component';
import { CommitteeReportsComponent } from '@app/committee-reports/committee-reports.component';
import { PrivilegeSpeechesComponent } from '@app/privilege-speeches/privilege-speeches.component';
import { VehicleFranchiseComponent } from '@app/vehicle-franchise/vehicle-franchise.component';
import { NgoAccreditationComponent } from '@app/ngo-accreditation/ngo-accreditation.component';
import { SubdivisionsComponent } from '@app/subdivisions/subdivisions.component';
import { OthersComponent } from '@app/others/others.component';
import { MemorandaComponent } from '@app/memoranda/memoranda.component';
import { MembersComponent } from '@app/members/members.component';
import { MembersViewComponent } from '@app/members/members-view/members-view.component';
import { MembersInfoComponent } from '@app/members/members-info/members-info.component';
import { ReferencesComponent } from '@app/references/references.component';
import { UsersComponent } from '@app/users/users.component';
import { CommitteesComponent } from '@app/committees/committees.component';
import { SettingsComponent } from '@app/settings/settings.component';
import { AccountComponent } from '@app/account/account.component';
import { LogsComponent } from '@app/logs/logs.component';
import { BackupRestoreComponent } from '@app/backup-restore/backup-restore.component';
import { AuthGuardService } from '@core/services';

export const routes: Routes = [
  { path: 'dashboard',            component: DashboardComponent },
  { path: 'ordinances',           component: OrdinancesComponent },
  { path: 'resolutions',          component: ResolutionsComponent },
  { path: 'sessions',             component: SessionsComponent },
  { path: 'committee-reports',    component: CommitteeReportsComponent },
  { path: 'privilege-speeches',   component: PrivilegeSpeechesComponent },
  { path: 'vehicle-franchise',    component: VehicleFranchiseComponent },
  { path: 'accreditation',        component: NgoAccreditationComponent },
  { path: 'subdivisions',         component: SubdivisionsComponent },
  { path: 'others',               component: OthersComponent },
  { path: 'memoranda',            component: MemorandaComponent },
  { path: 'members',              component: MembersComponent,
    children: [
      { path: '', component: MembersViewComponent },
      { path: ':id', component: MembersInfoComponent },
    ]
  },
  { path: 'references',           component: ReferencesComponent },
  { path: 'users',                component: UsersComponent },
  { path: 'committees',           component: CommitteesComponent },
  // { path: 'settings',             component: SettingsComponent },
  { path: 'account',              component: AccountComponent },
  { path: 'logs',                 component: LogsComponent },
  { path: 'backup-restore',       component: BackupRestoreComponent }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
