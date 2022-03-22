ApiParams = {};

ApiParams.get = function () {
  return {
    error: false,
    status_code: 200,
    msg: "",
    form_errors: null,
    results: [],
    results_count: 0,
    is_logged: true,
    forced_login: false,
    token: "",
    // 'api_version'           => env('API_VERSION'),
  };
};

module.exports = ApiParams;
