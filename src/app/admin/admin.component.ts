import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Location, PopStateEvent } from '@angular/common';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter } from 'rxjs/operators';
import PerfectScrollbar from 'perfect-scrollbar';

// SERVICES
import { LoadingService } from '@services/loading/loading.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, AfterViewInit {

  isLoading: boolean;
  private _router: Subscription;
  private lastPoppedUrl: string;
  private yScrollStack: number[] = [];

  constructor(
    public location: Location,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadingService.loadingEmitter.subscribe( isLoading => {
      this.isLoading = isLoading;
    });

    const isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;

    if (
      isWindows &&
      !document
        .getElementsByTagName('body')[0]
        .classList.contains('sidebar-mini')
    ) {
      // if we are on windows OS we activate the perfectScrollbar function

      document
        .getElementsByTagName('body')[0]
        .classList.add('perfect-scrollbar-on');
    } else {
      document
        .getElementsByTagName('body')[0]
        .classList.remove('perfect-scrollbar-off');
    }
    const elemMainPanel = document.querySelector('.main-panel') as HTMLElement;
    const elemSidebar = document.querySelector('.sidebar .sidebar-wrapper') as HTMLElement;


    this.location.subscribe((ev: PopStateEvent) => {
      this.lastPoppedUrl = ev.url;
    });
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        if (event.url !== this.lastPoppedUrl)
          {this.yScrollStack.push(window.scrollY);}
      } else if (event instanceof NavigationEnd) {
        if (event.url === this.lastPoppedUrl) {
          this.lastPoppedUrl = undefined;
          window.scrollTo(0, this.yScrollStack.pop());
        } else {window.scrollTo(0, 0);}
      }
    });
    // eslint-disable-next-line no-underscore-dangle
    this._router = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        elemMainPanel.scrollTop = 0;
        elemSidebar.scrollTop = 0;
      });
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      let ps = new PerfectScrollbar(elemMainPanel);
      ps = new PerfectScrollbar(elemSidebar);
    }
  }

  ngAfterViewInit() {
    this.runOnRouteChange();
  }

  runOnRouteChange(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemMainPanel = document.querySelector('.main-panel') as HTMLElement;
      const ps = new PerfectScrollbar(elemMainPanel);
      ps.update();
    }
  }

  isMac(): boolean {
    let bool = false;
    if (
      navigator.userAgent.toUpperCase().indexOf('MAC') >= 0 ||
      navigator.userAgent.toUpperCase().indexOf('IPAD') >= 0
    ) {
      bool = true;
    }
    return bool;
  }
}
