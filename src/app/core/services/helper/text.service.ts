/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';

@Injectable()
export class TextService {
  constructor() {}

  formatErrors(msgs, form_errors, separator = '<br />') {
    let msg = '';
    if (typeof form_errors !== 'undefined' && form_errors != null) {
      const list = Object.keys(form_errors);
      if (list.length > 0) {
        list.forEach(function(key, i) {
          msg += form_errors[key].message + separator;
        });
        return msg;
      }
    }
    return msgs;
  }

  serialize(obj: any) {
    // Remove all null values in an object
    Object.keys(obj).forEach(
      (key) => (obj[key] === undefined || obj[key] === null) && delete obj[key]
    );

    // Minified solution from http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object
    return Object.keys(obj)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
      .join('&');
  }

  ucWords(str) {
    return (str + '').replace(
      /^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g,
      function($1) {
        return $1.toUpperCase();
      }
    );
  }

  formatDefaultDate(value) {
    if (!value) {return '';}
    const dYear = value.toString().substring(0, 4);
    const dMonth = value.toString().substring(4, 6);
    const dDay = value.toString().substring(6, 8);
    return `${dYear}-${dMonth}-${dDay}`;
  }
}
