/* eslint-disable @typescript-eslint/naming-convention */
export interface APIResponse {
  error: boolean;
  forced_login: boolean;
  form_errors: any;
  is_logged: boolean;
  msg: string;
  results: any;
  results_count: number;
  status_code: number;
  token: string;
  total_count: number;
  file?: any;
};
