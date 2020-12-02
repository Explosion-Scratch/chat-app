/* ////////////////////////////////////////// */
/* //////////////////Credits///////////////// */
/* ////////////////////////////////////////// */
/*------------------------------------------- */
// Many thanks to GrahamSH-LLK for a TON of help with this project. He helped make this more secure from XSS attacks, he also helped implement markdown, and he gave me general advice on this project. Go follow him!
/* ------------------------------------------ */
// Thanks also goes to the many testers of this project, such as ahmeti, Ani-Xan, wgyt and many more.
//   --Explosion--

// © 2020 --Explosion--, All rights reserved

var windowtime = 0;
var myChannel = "";
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
  unread = document.querySelectorAll("li").length + 1;
  var message = document.getElementById("message").value;
  if (message != "") {
    // Save in DB
    firebase
      .database()
      .ref(myChannel)
      .push()
      .set({
        sender: escape(myName),
        message: HtmlSanitizer.SanitizeHtml(html(emotes(message))),
        time: time(),
        channel: myChannel
      });
    // Prevent submit;
    document.getElementById("message").value = "";
    document
      .getElementById("messages")
      .scrollTo(0, document.getElementById("messages").scrollHeight);
  } else {
    alert("Please enter a value");
  }
  return false;
}

// Listen for incoming messages
firebase
  .database()
  .ref(myChannel)
  .on("child_added", function (snapshot) {
    if (snapshot.val().sender !== myName && windowtime > 2000) {
      playsound();
    }
    document
      .getElementById("messages")
      .scrollTo(0, document.getElementById("messages").scrollHeight);

    if (
      snapshot.val().sender !== myName &&
      snapshot.val().message.includes("@" + myName) &&
      windowtime > 4000
    ) {
      playsound(
        "https://proxy.notificationsounds.com/notification-sounds/undeniable-575/download/file-sounds-1122-undeniable.mp3"
      );
    }
    // Add them
    var html = "";
    html +=
      "<li onclick='updatemessage(this)' data-channel='" +
      snapshot.val().channel +
      "'id='message-" +
      snapshot.key +
      "'>";
    html += "<span id='message-sender'>" + snapshot.val().sender;
    // Delete btn
    if (snapshot.val().sender == myName) {
      html +=
        "<button onclick='deleteMessage(this)' data-id='" + snapshot.key + "'>";
      html += "Delete";
      html += "</button>";
    }
    html +=
      "</span><span id='message-text'>" + snapshot.val().message + "</span>";
    html += `<span id='message-date' data-date='${snapshot.val().time
      }'></span><span id='quote' onclick='quote(this)'>Quote</span>`;
    document.getElementById("messages").innerHTML += html;

    if (snapshot.val().sender == myName) {
      document.getElementById("message-" + snapshot.key).classList.add("me");
    }

    // Highlight
    highlight();
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
    self.parentElement.parentElement.querySelector("#quote").remove();

    firebase.database().ref(myChannel).child(id).remove();
  }
}

// Listener
firebase
  .database()
  .ref(myChannel)
  .on("child_removed", function (snapshot) {
    document.querySelector(
      `#${"message-" + snapshot.key} #message-text`
    ).innerHTML = "<i>Deleted</i>";
    document.querySelector(`#${"message-" + snapshot.key} button`).remove();
  });

// Update on message edit
firebase
  .database()
  .ref(myChannel)
  .on("child_changed", function (snapshot) {
    var html = `<span id='message-sender'>${snapshot.val().sender}`;
    if (snapshot.val().sender == myName) {
      html +=
        "<button onclick='deleteMessage(this)' data-id='" + snapshot.key + "'>";
      html += "Delete";
      html += "</button>";
    }
    html += `</span><span id='message-text'>${snapshot.val().message
      }</span><span id='message-date'>${formatted_date(
        snapshot.val().time
      )}</span><span id='quote' onclick='quote(this)'>Quote</span>`;
    document.getElementById("message-" + snapshot.key).innerHTML = html;

    // Highligh
    highlight();
  });

function time() {
  // Get seconds
  return Date.now();
}
function formatted_date(date) {
  var output = date_thing(date);
  function date_thing(date) {
    // Universal time
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
  output = output.replace(/^-30 seconds ago/, "Just now");
  output = output.replace(/^50 years ago/, "Just now");
  output = output.replace(/^0 seconds ago/, "Just now");
  output = output.replace(/^30 seconds ago/, "Less than a minute ago");
  output = output.replace(/^60 seconds ago/, "1 minute ago");
  output = output.replace(/^1 minutes ago/, "1 minute ago");
  output = output.replace(/^1 days ago/, "1 day ago");
  output = output.replace(/^1 months ago/, "1 month ago");
  output = output.replace(/^1 years ago/, "1 year ago");
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
  if (window.localStorage.getItem("user") == null) {
    var promptinput = prompt("What do you want to be called?");
    while (promptinput == null || promptinput == "") {
      promptinput = prompt(
        "Sorry, you must enter a value, what would you like to be called?"
      );
    }
    window.localStorage.setItem("user", promptinput.trim().replace(/\s/g, ""));
  } else {
    var promptinput = window.localStorage.getItem("user");
  }
  var channelurl = window.location.search;
  channelurl = new URLSearchParams(channelurl);
  channelurl = channelurl.get("channel");

  if (channelurl == null) {
    myChannel = prompt("What channel do you want to be in?");
    // Regex for prompt
    while (!/^[a-zA-Z\d]*$/.test(myChannel)) {
      myChannel = prompt(
        "What channel do you want to be in? (ANswer must be only letters and numbers, no spaces)"
      );
    }
  } else {
    myChannel = channelurl;
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

// Stuff that needs to be running constantly
setInterval(() => {
  // Update the dates on messages
  updatedates();
  // After the use has entered their name increment this timer, which makes the sound not play when messages load
  if (myName != null) {
    windowtime += 50;
  }
  // Update the title
  if (document.querySelectorAll("li").length > unread) {
    // If there are unread messages
    document.title = `(${document.querySelectorAll("li").length - unread
      }) Chat App`;
  } else {
    // If there aren't
    document.title = "Chat App";
  }

  // Update name thing at the top
  document.getElementById("me").innerText = `Sending messages as ${myName}`;
}, 50);

// Unread messages in the header
document.addEventListener("mousemove", (e) => {
  unread = document.querySelectorAll("li").length;
});
document.addEventListener("mousedown", (e) => {
  unread = document.querySelectorAll("li").length;
});
document.addEventListener("keydown", (e) => {
  unread = document.querySelectorAll("li").length;
});

// Fullscreen mode
function fullscreen() {
  document.documentElement.requestFullscreen();
}

// Markdown to HTML with options
function html(markdown) {
  // Thanks to @GrahamSH-LLK for helping with this
  var converter = new showdown.Converter({
    backslashEscapesHTMLTags: true,
    simplifiedAutoLink: true,
    tables: true
  });

  // GitHub like markdown
  showdown.setFlavor("github");
  // Finally actually use markdown
  var output = converter.makeHtml(markdown);
  return output;
}

// Replace certain strings
function emotes(str) {
  var output = str;
  output = output.replace(/\/shrug/g, "&macr;&#92;_(ツ)_/&macr; ");
  output = output.replace(/\/tableflip/g, "(╯°□°）╯︵ ┻━┻");
  output = output.replace(/\/unflip/g, "┬─┬ ノ( ゜-゜ノ)");
  output = output.replace(/\/eyes/g, "( ಠ ͜ʖ ಠ ) ");
  output = output.replace(/\/bye/g, "ʕ•́ᴥ•̀ʔっ");
  output = output.replace(/\/facepalm/g, "(－‸ლ)");
  output = output.replace(/\/bruh/g, "(ㆆ_ㆆ)");
  output = output.replace(/\/cheers/g, "(っ＾▿＾)۶🍸🌟🍺٩(˘◡˘ )");
  output = output.replace(/\/infinite/g, "∞");
  output = output.replace(/\/lol/g, "🇱​​​​​🇴​​​​​🇱");
  output = output.replace(/\/imposter/g, "ඞඞ");
  output = output.replace(/\/fancy/g, "**•.¸♥¸.•*");
  // This one is actually usefull for making line breaks
  output = output.replace(/\\n/g, "\n");
  output = output.replace(/\\t/g, "  ");
  return output;
}
function playsound(
  url = "https://proxy.notificationsounds.com/notification-sounds/me-too-603/download/file-sounds-1144-me-too.mp3"
) {
  // Play the sound, if no argument is given play the message sound.
  var audio = new Audio(url);
  audio.play();
}

function updatedates() {
  // This function runs through all the list items and updates the date on them.
  var dates = document.querySelectorAll("ul li span#message-date");
  for (let i = 0; i < dates.length; i++) {
    const el = dates[i];
    el.innerText = formatted_date(el.getAttribute("data-date"));
  }
}

function highlight() {
  document.querySelectorAll("code").forEach((block) => {
    hljs.highlightBlock(block);
  });
}
function updatemessage(thing) {
  thing.focus();
  if (
    thing
      .querySelector("#message-sender")
      .innerText.replace("Delete", "")
      .replace("\n", "") === myName
  ) {
    var messageid = thing.id.replace(/^message-/, "");
    thing
      .querySelector("#message-text")
      .setAttribute("contenteditable", "true");
    thing.querySelector("#message-text").onblur = (e) => {
      thing
        .querySelector("#message-text")
        .setAttribute("contenteditable", "false");
      update(messageid, thing.querySelector("#message-text").innerText);
    };
  }
}
function update(message, newtext) {
  firebase
    .database()
    .ref(myChannel)
    .child(message)
    .update({
      sender: escape(myName),
      message: HtmlSanitizer.SanitizeHtml(html(emotes(newtext))),
      time: time(),
      channel: myChannel
    });
}

// Quote
function quote(el) {
  document.getElementById("message").value += `>${el.parentElement.querySelector("#message-text").innerText
    }`;
}

var app = new Vue({ el: "body" });
