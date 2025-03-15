import { sleep, group, check } from "k6";
import http from "k6/http";
import { getFormKey } from "./helper.js";

export const options = {
  cloud: {
    distribution: {
      "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
    },
    apm: [],
  },
  scenarios: {
    Scenario_1: {
      executor: "ramping-vus",
      stages: [
        { target: 5, duration: "30s" },
        { target: 5, duration: "30s" },
        { target: 0, duration: "30s" },
      ],
      exec: "reservedLogin",
    },
  },
};

export function reservedLogin() {
  let getCustomerAccountLoginPageRequest = {
    method: "GET",
    url: "https://www.reserved.com/gb/en/customer/account/login/",
    params: {
        tags: {
            name: 'RE - Get Customer Account Login Page'
        }
    }
  };

  let getVarnishAjaxNewIndexRequest = {
    method: "GET",
    url: "https://www.reserved.com/gb/en/varnish/ajax/newindex/?1742033950116",
    params: {
        tags: {
            name: 'RE - Get Varnish New Index'
        }
    }
  };

  let getVarnishAjaxIndexRequest = {
    method: "GET",
    url: "https://www.reserved.com/gb/en/varnish/ajax/index/?1742033950116",
    params: {
        tags: {
            name: 'RE - Get Varnish Index'
        }
    }
  };

  function postCustomerLoginRequest(formKeyData) {
    return {
      method: "POST",
      url: "https://www.reserved.com/gb/en/ajx/customer/login/referer/aHR0cHM6Ly93d3cucmVzZXJ2ZWQuY29tL2diL2VuLw,,/uenc/aHR0cHM6Ly93d3cucmVzZXJ2ZWQuY29tL2diL2VuLw,,/?lpp_new_login",
      body: {
        "login[username]": "",
        "login[password]": "",
        "login[remember_me]": "1",
        form_key: formKeyData,
      },
      params: {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
            tags: {
                name: 'RE - post Customer Login'
        }
        },
    };
  }

  let getMainPageRequest = {
    method: "GET",
    url: "https://www.reserved.com/gb/en/",
    params: {
        tags: {
            name: 'RE - Get Main Page'
        }
    }
  };

  let getCheckoutCartRequest = {
    method: "GET",
    url: "https://www.reserved.com/gb/en/ajx/checkoutcart/get/",
    params: {
        tags: {
            name: 'RE - Get Checkout Cart'
        }
    }
  };

  group(
    "Login Page - https://www.reserved.com/gb/en/customer/account/login/#login",
    function () {
      let getCheckoutCartRequestResponse = http.get(
        getCustomerAccountLoginPageRequest.url,
        getCustomerAccountLoginPageRequest.params
      );
      check(getCheckoutCartRequestResponse, {'GET - status was 200' : (r) => r.status == 200})
      let formKey = getFormKey(getCheckoutCartRequestResponse);
    //   console.log("to tu" + formKey);
      let getVarnishAjaxIndexRequestLog = http.get(
        getVarnishAjaxNewIndexRequest.url,
        getVarnishAjaxNewIndexRequest.params
      );
      // console.log(getVarnishAjaxIndexRequestLog.body)
    check(getVarnishAjaxIndexRequestLog, {'GET - status 200' : (r) => r.status == 200})
      http.get(getVarnishAjaxIndexRequest.url, getVarnishAjaxIndexRequest.params);

      http.post(
        postCustomerLoginRequest().url,
        postCustomerLoginRequest(formKey).body,
        postCustomerLoginRequest().params
      );
    }
  );

  group(
    "Main Page After User Log In - https://www.reserved.com/gb/en/",
    function () {
      http.get(getMainPageRequest.url);

      let getVarnishAjaxIndexRequestLog = http.get(
        getVarnishAjaxNewIndexRequest.url,
        getVarnishAjaxNewIndexRequest.params
      );
    //   console.log(getVarnishAjaxIndexRequestLog.body);

      http.get(getVarnishAjaxIndexRequest.url, getVarnishAjaxIndexRequest.params);

      http.get(getCheckoutCartRequest.url, getCheckoutCartRequest.params);

      sleep(1);
    }
  );
}
