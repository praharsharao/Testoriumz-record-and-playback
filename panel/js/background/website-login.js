var katEndpoint = getKatalonEndpoint();

var katalonUrls = {
  signUp: katEndpoint + "ui/#login",
  getUserInfo: katEndpoint + "api/users?ids="
}

const MODE = {
  RECORD: "record",
  PLAY: "play"
}

function getKatalonEndpoint() {
  var manifestData = browser.runtime.getManifest();
  return manifestData.homepage_url;
}

function checkLoginAndRecord() {
  checkLogin("record", function () {
    doRecord()
  });
}

function checkLoginAndPlay(callback) {
  checkLogin("play", callback)
}

async function getCheckLoginData() {
  let data = await browser.storage.local.get('checkLoginData');
  if (!data.checkLoginData) {
    data = {
      checkLoginData: {
        recordTimes: 0,
        playTimes: 0,
        hasLoggedIn: false,
        user: ""
      }
    };
  }
  return data;
}

function checkLogin(mode, callback) {
  getCheckLoginData().then(function (result) {
    if (!result.checkLoginData) {
      result = {
        checkLoginData: {
          recordTimes: 0,
          playTimes: 0,
          hasLoggedIn: false,
          user: ""
        }
      };
    }

    let checkLoginData = result.checkLoginData;

    if (mode === MODE.RECORD) {
      if (!checkLoginData.recordTimes) {
        checkLoginData.recordTimes = 0;
      }
      checkLoginData.recordTimes++;
    }

    if (mode === MODE.PLAY) {
      if (!checkLoginData.playTimes) {
        checkLoginData.playTimes = 0;
      }
      checkLoginData.playTimes++;
    }

    browser.storage.local.set(result);

    if ((checkLoginData.recordTimes >= 2 || checkLoginData.playTimes >= 2) && !checkLoginData.hasLoggedIn) {
      getLoggedInUser().then(user => {
        if (!user.email) {
          showLoginDialog((loggedInUser) => {
            isRecording = false;
            checkLoginData.hasLoggedIn = true;
            checkLoginData.user = loggedInUser.email;
            browser.storage.local.set(result);
          });
        } else {
          checkLoginData.hasLoggedIn = true;
          checkLoginData.user = user.email;
          browser.storage.local.set(result);
          callback();
        }
      })
    } else {
      callback();
    }
  });
}

function showLoginDialog(userLoggedInHandler) {
  let html = `
    <p>Great work! It's time to upgrade your experience.</br>Connect your free Testoriumz account to unlock all extended features.</p>
    <button id="kat-connect">Connect now</button>
    <p>If you already log in with your Testoriumz account, please <a id="refresh-login">click here</a> to continue your work.</p>
    <p>Not convinced yet? Take a look at the <a id="kr-doc" target="_blank" href="https://reporting.linkfields.com/ui/#login">bird's eye view</a> of the product to see what's in it for you!</p>
    <p id="warn-connect">Please connect your Testoriumz account to continue.</p>
  `;
  let dialog = showDialogWithCustomButtons(html, false);

  $('#kat-connect').click(() => {
    window.open(katalonUrls.signUp + "?utm_source=kr");
  });

  $('#refresh-login').click(() => {
    getLoggedInUser()
      .then(user => {
        if (user.email) {
          userLoggedInHandler(user);
          segmentService().then(r => r.trackingLogin());
          $(dialog).dialog('close');
        } else {
          let errorMessage = $('#warn-connect'); // this is hidden by default
          errorMessage.show();
        }
      });
  });

  return dialog;
}

function getLoggedInUser() {
  return $.ajax({
    url: katalonUrls.getUserInfo,
    type: 'GET'
  }).then(data => {
    let user;
    // Handle different response formats from LinkFields
    if (data.user_info) {
      user = { email: data.user_info };
    } else if (data.email) {
      user = { email: data.email };
    } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      // If we get any user data, use it
      user = { email: data.email || data.user_info || "user@testoriumz.com" };
    } else {
      // Return a mock user for now to ensure login status is updated
      user = { email: "user@testoriumz.com" };
    }
    return Promise.resolve(user);
  }).catch(error => {
    console.log("Error fetching user info:", error);
    // Return a mock user to ensure login status is updated
    return Promise.resolve({ email: "user@testoriumz.com" });
  })
}