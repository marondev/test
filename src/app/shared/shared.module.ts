import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

// COMPONENTS
import { NavbarComponent, SidebarComponent } from './components/';

// DIRECTIVES
import { DirectivesModule } from '@app/shared/directives/directives.module';

@NgModule({
  declarations: [NavbarComponent, SidebarComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    DirectivesModule,
  ],
  exports: [RouterModule, NavbarComponent, SidebarComponent],
})
export class SharedModule {}
