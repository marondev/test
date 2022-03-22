import { Component, OnInit } from '@angular/core';

// SERVICES
import { AuthService } from '@services/auth/auth.service';

// DATA
import { mainRoutes } from './data';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  menuItems: any = [];
  user: any;
  syncing = false;
  syncMessage = 'Sync';

  constructor(
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.menuItems = mainRoutes;
    this.me();
    this.authService.avatarEmit(false);
    this.authService.avatarEmitter.subscribe((avatar) => {
      if (avatar) {this.me();}
    });
  }

  me(): void {
    this.authService.me(true).subscribe((user) => {
      if (user) {
        this.user = user;
        if (user.avatar) {
          const byteArray = new Uint8Array(user.avatar.data);
          this.user.avatar = new Blob([byteArray], { type: 'image/png' });
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
