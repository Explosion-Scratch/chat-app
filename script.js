  var timer = 0;
  var windowtime = 0;
  var firebaseConfig = {
    apiKey: "AIzaSyCGO99iGzMYFTQZC0p1e_PJdaXw9cIifDw",
    authDomain: "test-project-30164.firebaseapp.com",
    databaseURL: "https://test-project-30164.firebaseio.com",
    projectId: "test-project-30164",
    storageBucket: "test-project-30164.appspot.com",
    messagingSenderId: "706571823396",
    appId: "1:706571823396:web:4c720e7b25f1d437a6ebb1"
  };

  firebase.initializeApp(firebaseConfig);

  var myName = promptuser();

  function sendMessage() {
    if (timer > 2000) {
    timer = 0;
      unread = document.querySelectorAll("li").length + 1;
      var message = document.getElementById("message").value;
      if (message != "") {
    // Save in DB
    firebase
      .database()
      .ref("messages")
      .push()
      .set({
        sender: escape(myName),
        message: HtmlSanitizer.SanitizeHtml(html(message)),
        time: time()
      });
        // Prevent submit;
        document.getElementById("message").value = "";
        document
          .getElementById("messages")
          .scrollTo(0, document.getElementById("messages").scrollHeight);
      } else {
    alert("Please enter a value");
      }
    } else {
    playsound(
      "https://proxy.notificationsounds.com/notification-sounds/unsure-566/download/file-sounds-1114-unsure.mp3"
    );
      alert("You must wait 2 seconds between messages");
    }
    return false;
  }

  // Listen for incoming messages
  firebase
    .database()
    .ref("messages")
    .on("child_added", function (snapshot) {
      if (snapshot.val().sender !== myName && windowtime > 2000) {
    playsound();
      }
      var html = "";
      html += "<li id='message-" + snapshot.key + "'>";
      html += "<span id='message-sender'>" + snapshot.val().sender;
    // Delete btn
      if (snapshot.val().sender == myName) {
        html +=
        "<button onclick='deleteMessage(this)' data-id='" +
        snapshot.key +
        "'>";
        html += "Delete";
        html += "</button>";
      }
      html +=
        "</span><span id='message-text'>" + snapshot.val().message + "</span>";
      html += `<span id='message-date' data-date='${
        snapshot.val().time
      }'></span>`;
      document.getElementById("messages").innerHTML += html;
      document
        .getElementById("messages")
        .scrollTo(0, document.getElementById("messages").scrollHeight);

      if (snapshot.val().sender == myName) {
    document.getElementById("message-" + snapshot.key).classList.add("me");
      }
    });

  function deleteMessage(self) {
    if (
      window.confirm(
        "Are you sure you would like to delete this message? The message will be permantly deleted if you click ok"
      )
    ) {
      // Message id
      var id = self.getAttribute("data-id");

      // Delete
      firebase.database().ref("messages").child(id).remove();
    }
  }

  // Listener
  firebase
    .database()
    .ref("messages")
    .on("child_removed", function (snapshot) {
    document.querySelector(
      `#${"message-" + snapshot.key} #message-text`
    ).innerHTML = "<i>Deleted</i>";
    });

  firebase
    .database()
    .ref("messages")
    .on("child_changed", function (snapshot) {
      var html = `<span id='message-sender'>${
    snapshot.val().sender
  }</span><span id='message-text'>${snapshot.val().message}</span>`;
      document.getElementById("message-" + snapshot.key).innerHTML = html;
    });

  function time() {
    return Date.now();
  }
  function formatted_date(date) {
    var output = date_thing(date);
    function date_thing(date) {
      var seconds = Math.floor((new Date() - date) / 1000);
      var interval = seconds / 31536000;

      if (interval > 1) {
        return Math.floor(interval) + " years";
      }
      interval = seconds / 2592000;
      if (interval > 1) {
        return Math.floor(interval) + " months";
      }
      interval = seconds / 86400;
      if (interval > 1) {
        return Math.floor(interval) + " days";
      }
      interval = seconds / 3600;
      if (interval > 1) {
        return Math.floor(interval) + " hours";
      }
      interval = seconds / 60;
      if (interval > 1) {
        return Math.floor(interval) + " minutes";
      }
      return Math.floor(seconds / 30) * 30 + " seconds";
    }
    output = output + " ago";
    output = output.replace(/^0 seconds ago/, "Just now");
    output = output.replace(/^60 seconds ago/, "1 minute ago");
    output = output.replace(/^1 minutes ago/, "1 minute ago");
    return output;
  }
  function escape(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");
  }
function promptuser() {
  var promptinput = prompt("What do you want to be called?");
  while (promptinput == null || promptinput == "") {
    promptinput = prompt(
      "Sorry, you must enter a value, what would you like to be called?"
    );
  }
  return promptinput.trim().replace(/\s/g, "");
}
var unread = null;
window.onblur = function () {
  unread = document.querySelectorAll("li").length;
};
window.onfocus = function () {
  unread = document.querySelectorAll("li").length;
};
setInterval(() => {
  updatedates();
  timer = timer + 50;
  if (myName != null) {
    windowtime += 50;
  }
  if (document.querySelectorAll("li").length > unread) {
    document.title = `(${document.querySelectorAll("li").length - unread
      }) Chat App`;
  } else {
    document.title = "Chat App";
  }
}, 50);

document.addEventListener("mousemove", (e) => {
  unread = document.querySelectorAll("li").length;
});
document.addEventListener("mousedown", (e) => {
  unread = document.querySelectorAll("li").length;
});
document.addEventListener("keydown", (e) => {
  unread = document.querySelectorAll("li").length;
});
function fullscreen() {
  document.documentElement.requestFullscreen();
}
function html(markdown) {
  var converter = new showdown.Converter({
    backslashEscapesHTMLTags: true,
    simplifiedAutoLink: true,
    tables: true
  });

  showdown.setFlavor("github");
  var output = converter.makeHtml(markdown);
  output = output.replace("/shrug", "&macr;\\_(ツ)_/&macr; ");
  output = output.replace("/tableflip", "┬─┬ノ( º _ ºノ) ");
  output = output.replace("/eyes", "( ಠ ͜ʖ ಠ ) ");
  return output;
}

function playsound(
  url = "https://proxy.notificationsounds.com/notification-sounds/me-too-603/download/file-sounds-1144-me-too.mp3"
) {
  var audio = new Audio(url);
  audio.play();
}

function updatedates() {
  var dates = document.querySelectorAll("ul li span#message-date");
  for (let i = 0; i < dates.length; i++) {
    const el = dates[i];
    el.innerText = formatted_date(el.getAttribute("data-date"));
  }
}
