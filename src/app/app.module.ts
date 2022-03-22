import 'reflect-metadata';
import '../polyfills';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

// MAIN MODULE
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { AppRoutingModule } from '@app/app-routing.module';

// MATERIAL
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// NG TRANSLATE
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// COMPONENTS
import { AppComponent } from '@app/app.component';
import { LoginComponent } from '@app/login/login.component';
import { AdminComponent } from '@app/admin/admin.component';

// SHARED COMPONENTS
import { SpinnerComponent } from '@shared/modals';

// JWT
import { JwtModule } from '@auth0/angular-jwt';
export function tokenGetter() {
  return sessionStorage.getItem('token');
}

// FIREBASE
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

// ENV
import { environment } from '@env/environment';

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent,
    SpinnerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    AppRoutingModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: ['localhost:7777'],
      },
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    AngularFireModule.initializeApp(environment.firebase, 'legisled'),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    MatSnackBarModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
