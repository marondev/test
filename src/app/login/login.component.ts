import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// SERVICES
import { AuthService } from '@services/auth/auth.service';
import { SnackBarService } from '@app/core/services/snack-bar/snack-bar.service';

// CONSTANT
import { errConst } from '@core/data/constant';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  userForm: FormGroup;

  constructor(
    private router: Router,
    private auth: AuthService,
    private snackBarService: SnackBarService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    if ( sessionStorage.getItem('token') ) {
      sessionStorage.clear();
    }

    this.userForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80),
        ],
      ],
    });
  }

  onSubmit(): void {
    const {
      username,
      password,
    } = this.userForm.value;

    const body = {
      username,
      password
    };

    this.auth.login( body ).subscribe( ( res: any ) => {
      if ( !res.error ) {
        if ( res.results_count ) {
          sessionStorage.setItem( 'token', res.token );
          this.snackBarService.successMessage(res.msg);
          setTimeout( () => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        };
      } else {
        this.snackBarService.errorMessage(res.msg);
        this.userForm.setValue({
          username: '',
          password: ''
        });
      };
    }, (error) => this.snackBarService.errorMessage(error) );
  }
}
