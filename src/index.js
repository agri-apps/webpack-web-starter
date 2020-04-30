import "./assets/css/index.css";
import * as Router from "navigo";
import createStore from "./store";
import { slideDiv, tmpl } from "./helpers";

import aboutHTML from "./pages/about.html";
import homeHTML from "./pages/home.html";

var root = null;
var useHash = true;
var hash = "#!";
var router = new Router(root, useHash, hash);

const storeKey = "webpack+html";

let state = localStorage.getItem(storeKey)
  ? JSON.parse(localStorage.getItem(storeKey))
  : {
      message: "Time!",
      time: new Date().toISOString("en-US"),
      subscribed: false,
    };

const store = createStore(state, ({ key, newValue, oldValue, state }) => {
  if (!state.subscribed) {
    state.email = "";
  }
  localStorage.setItem(storeKey, JSON.stringify(state));
});

let currentHTML = "";

const validations = {
  subscriber: (values, done) => {
    if (values.email) {
      store.remove("subscribeError");
      done();
    } else {
      store.set("subscribeError", "Please enter your email.");
      update();
    }
  },
};

function $id(id) {
  return document.getElementById(id);
}

function update(html) {
  unbind();
  if (html) {
    currentHTML = html;
  }
  loadHTML("content", tmpl(currentHTML, store.getStore()));
  bindAll();
}

function unbind() {
  [].slice.call(document.querySelectorAll("[data-bind]")).forEach((item) => {
    let evt = item.dataset["event"] || "blur";
    item.removeEventListener(evt, listen, false);
  });
}

function bindAll() {
  [].slice.call(document.querySelectorAll("[data-bind]")).forEach((item) => {
    let evt = item.dataset["event"] || "blur";
    item.addEventListener(evt, listen, false);
  });
}

function loadHTML(id, html) {
  $id(id).innerHTML = html;
}

function listen(e) {
  const { target } = e;

  const {
    value,
    event = "blur",
    bind,
    refresh,
    type,
    validation,
  } = target.dataset;

  const convert = (str) => {
    let converters = {
      bool: `${str}` === "true" || `${str}` === "1",
      date: Date.parse(str),
      number: parseFloat(str),
    };
    if (converters.hasOwnProperty(type)) {
      return converters[type];
    }
    return str;
  };

  let done = () => {};

  console.log("listen", value, event, bind);

  switch (event) {
    case "click":
      if (value) {
        done = () => {
          store.set(bind, convert(value));
        };
      }
      break;
    case "blur":
    case "change":
      if (value) {
        done = () => {
          store.set(bind, convert(value));
        };
      } else if (target.value) {
        done = () => {
          store.set(bind, convert(target.value));
        };
      }
      break;
  }

  let updateFn = () => {
    if (refresh || target.hasAttribute("data-refresh")) {
      update();
    }
  };

  if (!validation || !validations[validation]) {
    done();
    updateFn();
  } else {
    validations[validation]({ ...store.getStore(), [bind]: value }, () => {
      done();
      updateFn();
    });
  }
}

router.hooks({
  before: (done) => {
    store.set("time", new Date().toISOString("en-US"));

    // slide transitions
    let el = $id("content");
    if (el && el.firstChild) {
      slideDiv(el.firstChild, "left", 150);
      setTimeout(() => {
        done();
      }, 100);
    } else {
      done();
    }
  },
  after: () => {
    bindAll();
  },
});

router
  .on({
    about: () => {
      update(aboutHTML);
    },
    "*": () => {
      update(homeHTML);
    },
  })
  .resolve();
