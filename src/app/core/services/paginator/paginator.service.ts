import { Injectable } from '@angular/core';

export interface Paginator {
  pages: number;
  currrentPage: number;
  offset: number;
  take: number;
  pagesLimit: number;
  pagesBatch: number;
  pagesFrom: number;
  pagesTo: number;
  nextPageOffset: number;
  prevPageOffset: number;
  hasPrev: boolean;
  hasNext: boolean;
  displayPages: number[];
}

@Injectable({
  providedIn: 'root'
})

export class PaginatorService {

    // Author: RYAN DEJANDO BINAS
    paginate( totalCount: number, take: number, offset: number, pagesLimit: number ): Paginator {

      offset = offset >= totalCount ? totalCount - 1 : offset;

      const pages = Math.ceil( totalCount / take );
      const currrentPage = Math.ceil( offset / take ) + 1 >= pages ? pages : Math.ceil( offset / take ) + 1;
      const pagesBatch = offset >= totalCount ? -1 : Math.ceil( currrentPage / pagesLimit );

      const pagesFrom = pagesBatch ? (pagesBatch - 1)  * pagesLimit + 1 : 1;
      let pagesTo = pagesBatch * pagesLimit >= pages ? pages :  pagesBatch * pagesLimit;

      if ( pagesFrom === pagesTo && pagesFrom === 1 ) {pagesTo = 0;}

      const nextPageOffset = currrentPage * take < totalCount ? currrentPage * take : totalCount - 1;
      const prevPageOffset = (currrentPage - 2) * take >= 0 ? (currrentPage - 2) * take : 0;

      let hasNext = false;
      let hasPrev = false;

      if ( offset + take < totalCount ) {hasNext = true;}
      if ( offset - take >= 0 ) {hasPrev = true;}

      const displayPages: number[] = [];
      for ( let x = pagesFrom; x <= pagesTo; x++ ) {
        displayPages.push( x );
      }

      return {
        pages,
        currrentPage : offset >= totalCount ? 0 : currrentPage,
        offset,
        take,
        pagesLimit,
        pagesBatch,
        pagesFrom,
        pagesTo,
        nextPageOffset,
        prevPageOffset,
        hasPrev,
        hasNext,
        displayPages
      };
    }
}
