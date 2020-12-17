/* ////////////////////////////////////////// */
/* //////////////////Credits///////////////// */
/* ////////////////////////////////////////// */
/*------------------------------------------- */
// Many thanks to GrahamSH-LLK for a TON of help with this project. He helped make this more secure from XSS attacks, he also helped implement markdown, and he gave me general advice on this project. Go follow him!
/* ------------------------------------------ */
// Thanks also goes to the many testers of this project, such as ahmeti, Ani-Xan, wgyt and many more.
//   --Explosion--

// © 2020 --Explosion--, All rights reserved

// Declare some initial vars
var windowtime = 0;
var myChannel = "";
var clicktarget = null;

// Init firebase.
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

function sendMessage() {
  if (timesincemessage > 2000) {
    timesincemessage = 0; // Reset unread in the header
    unread = document.querySelectorAll("li").length + 1;
    // Set the message to send
    var message = document.getElementById("message").value;

    if (badwords(message)) {
      // Detect bad words
      alert("No bad words!");
      // Reset input
      document.getElementById("message").value = "";
      // Prevent form submit
      return false;
    }
    if (message != "") {
      // Save in DB
      firebase
        .database()
        .ref("channels/channel-" + myChannel)
        .push()
        .set({
          sender: escape(myName),
          message: HtmlSanitizer.SanitizeHtml(
            html(emotes(emojisfrom(message)))
          ),
          time: time(),
          channel: myChannel,
          ip: ip
        });
      firebase
        .database()
        .ref("newest")
        .push()
        .set({
          sender: escape(myName),
          message: HtmlSanitizer.SanitizeHtml(
            html(emotes(emojisfrom(message)))
          ),
          time: time(),
          channel: myChannel,
          ip: ip
        });
      // Reset input
      document.getElementById("message").value = "";
      // Scroll
      document
        .getElementById("messages")
        .scrollTo(0, document.getElementById("messages").scrollHeight);
    } else {
      // Ask for value
      alert("Please enter a value");
    }
  } else {
    alert("You have to wait 2 seconds between messages.");
  }
  // Prevent form submit
  return false;
}

function system_msg(message) {
  firebase
    .database()
    .ref("channels/channel-" + myChannel)
    .push()
    .set({
      sender: "𝘚𝘠𝘚𝘛𝘌𝘔",
      message: HtmlSanitizer.SanitizeHtml(
        html(emotes(emojisfrom(`*${message}*`)))
      ),
      time: time(),
      channel: myChannel,
      system: true
    });
}
// User auth

// Users logged in list along with their id's in firebase
var users = [];
var ids = [];

// Update on user add
firebase
  .database()
  .ref("users")
  .on("child_added", function (snapshot) {
    users.push(snapshot.val().user);
    ids.push(snapshot.key);
  });

// And remove
firebase
  .database()
  .ref("users")
  .on("child_removed", function (snapshot) {
    users = removeitem(snapshot.val().user, users);
    ids = removeitem(snapshot.key, ids);
  });

function adduser(user) {
  // Function to add a user
  if (!users.includes(user))
    firebase.database().ref("users").push().set({
      user: user
    });
}

function removeuser(user) {
  // Function to remove a user
  firebase.database().ref("users").child(ids[users.indexOf(user)]).remove();
}

function userexists(user) {
  // Test if user exists by checking in the local array made from firebase data
  if (users.includes(user)) {
    return true;
  } else {
    adduser(user);
    return false;
  }
}

function removeitem(item, array) {
  // Remove an item from an array

  // Get the item's index
  var index = array.indexOf(item);
  // Remove it
  if (index > -1) {
    array.splice(index, 1);
  }
  // Return array
  return array;
}

// If the user is new to our app and they navigated here then redirect them to the homepage.

if (window.localStorage.getItem("fromhome") == null) {
  window.location.pathname = "/home.html";
}
// Prompt the user for their name and the channel they want to be in
var myName = promptuser();

// After 2 seconds do this to make sure data is loaded from firebase.
setTimeout(function () {
  // IMPERSONATOR ALERT!!! lol
  if (userexists(myName) && window.localStorage.getItem("user") == null) {
    // If you are impersonating someone
    myName = "Impersonator";
  } else {
    // If it's just you registering.
    adduser(myName);
  }
  if (window.localStorage.getItem("leavejoin") === "true") {
    // Add a join message if the user didn't opt out of system notifs.
    system_msg(`${myName} joined the chat`);
  }
}, 2000);

// Listen for incoming messages
firebase
  .database()
  .ref("channels/channel-" + myChannel)
  .on("child_added", function (snapshot) {
    // If 1: you didn't send the message, 2: it's not firebase loading messages onload and 3: It's in my channel and 4: it does not mention me than play a sound.
    if (
      snapshot.val().sender !== myName &&
      windowtime > 2000 &&
      snapshot.val().channel === myChannel &&
      !snapshot.val().message.includes("@" + myName)
    ) {
      playsound();
    }

    // If the message DOES mention me than play a different sound
    if (snapshot.val().message.includes("@" + myName) && windowtime > 4000) {
      playsound(
        "https://proxy.notificationsounds.com/notification-sounds/undeniable-575/download/file-sounds-1122-undeniable.mp3"
      );
    }
    // Create and add list items
    var html = "";
    html +=
      "<li onclick='updatemessage(this)' data-channel='" +
      snapshot.val().channel +
      "'id='message-" +
      snapshot.key +
      "'>";
    html +=
      "<span id='message-sender'>" +
      HtmlSanitizer.SanitizeHtml(snapshot.val().sender);
    // Delete btn
    if (snapshot.val().sender == myName) {
      html +=
        "<button onclick='deleteMessage(this)' data-id='" + snapshot.key + "'>";
      html += "Delete";
      html += "</button>";
    }
    // Message text, date and quote button
    html +=
      "</span><span id='message-text'>" +
      HtmlSanitizer.SanitizeHtml(snapshot.val().message) +
      "</span>";
    html += `<span id='message-date' data-date='${snapshot.val().time
      }'></span><span id='quote' onclick='quote(this)'>Quote</span>`;
    document.getElementById("messages").innerHTML += html;

    // If the message is from the 'system' show something different
    if (snapshot.val().system) {
      // Display differently.
      document
        .getElementById("message-" + snapshot.key)
        .classList.add("system");
    }
    // If I wrote the message
    if (snapshot.val().sender == myName) {
      // Display the message differently.
      document.getElementById("message-" + snapshot.key).classList.add("me");
    }
    // Scroll down.
    document
      .getElementById("messages")
      .scrollTo(0, document.getElementById("messages").scrollHeight);
    sanitize(snapshot.key);
  });

function deleteMessage(self) {
  // Delete a message

  // Confirm the action
  if (
    window.confirm(
      "Are you sure you would like to delete this message? The message will be permantly deleted if you click ok"
    )
  ) {
    // Message id
    var id = self.getAttribute("data-id");
    // Delete
    self.parentElement.parentElement.querySelector("#quote").remove();

    // Remove from DB
    firebase
      .database()
      .ref("channels/channel-" + myChannel)
      .child(id)
      .remove();
  }
}

// Listen for deleted messages
firebase
  .database()
  .ref("channels/channel-" + myChannel)
  .on("child_removed", function (snapshot) {
    // And update and show them. No delete or quote either.
    document.querySelector(
      `#${"message-" + snapshot.key} #message-text`
    ).innerHTML = "<i>Deleted</i>";
    document
      .querySelector(`#${"message-" + snapshot.key} #message-text`)
      .blur();
    document.querySelector(`#${"message-" + snapshot.key} button`).remove();
    document.querySelector(`#${"message-" + snapshot.key} #quote`).remove();
  });

// Update on message edit
firebase
  .database()
  .ref("channels/channel-" + myChannel)
  .on("child_changed", function (snapshot) {
    var html = `<span id='message-sender'>${HtmlSanitizer.SanitizeHtml(
      snapshot.val().sender
    )}`;
    if (snapshot.val().sender == myName) {
      html +=
        "<button onclick='deleteMessage(this)' data-id='" + snapshot.key + "'>";
      html += "Delete";
      html += "</button>";
    }
    html += `</span><span id='message-text'>${HtmlSanitizer.SanitizeHtml(
      emojisfrom(snapshot.val().message)
    )}</span><span id='message-date'>${formatted_date(
      snapshot.val().time
    )}</span><span id='quote' onclick='quote(this)'>Quote</span>`;
    document.getElementById("message-" + snapshot.key).innerHTML = html;
    sanitize(snapshot.key);
  });

function time() {
  // Get seconds
  // This used to be time-zone specific.
  return Date.now();
}

function formatted_date(date) {
  // Return a formatted "___ ago" date
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
  // Special cases.
  output = output + " ago";
  output = output.replace(/^-30 seconds ago/, "Just now");
  output = output.replace(/^50 years ago/, "Just now");
  output = output.replace(/^0 seconds ago/, "Just now");
  output = output.replace(/^30 seconds ago/, "Less than a minute ago");
  output = output.replace(/^60 seconds ago/, "1 minute ago");
  output = output.replace(/^1 minutes ago/, "1 minute ago");
  output = output.replace(/^1 hours ago/, "1 hour ago");
  output = output.replace(/^1 days ago/, "1 day ago");
  output = output.replace(/^1 months ago/, "1 month ago");
  output = output.replace(/^1 years ago/, "1 year ago");


  output = HtmlSanitizer.SanitizeHtml(output);

  // Return the formatted date
  return output;
}

function escape(unsafe) {
  // Escape HTML, thanks to stackoverflow.
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function promptuser() {
  // Ask user for their channel and name

  // If they came from the home screen
  if (window.localStorage.getItem("fromhome") !== null) {
    var promptinput = "";

    // If they aren't already logged in.
    if (window.localStorage.getItem("user") == null) {
      // Initial prompt
      promptinput = prompt("What do you want to be called?");

      // Keep prompting until the user enters something correct.
      while ((promptinput == null || promptinput === "") && /[a-zA-Z0-9]{3,20}$/.test(promptinput)) {
        // Error prompt.
        promptinput = prompt("Error! Try another name!");
      }
      // Add the user to localStorage, e.g. log them in.
      window.localStorage.setItem(
        "user",
        promptinput.trim().replace(/\s/g, "")
      );
    } else {
      // If the user is already logged in don't ask for the username.
      promptinput = window.localStorage.getItem("user");
    }

    // Parse url queries from the url. For example https://vnmpd.csb.app/?channel=channelhere

    var channelurl = window.location.search;
    channelurl = new URLSearchParams(channelurl);
    channelurl = channelurl.get("channel");

    if (channelurl == null) {
      // If there's no channel in the url ask for one.
      myChannel = prompt("What channel do you want to be in?");
      // Regex for prompt
      while (!/^[a-zA-Z\d]{0,20}$/.test(myChannel) || myChannel == null) {
        // Keep prompting.
        myChannel = prompt(
          "What channel do you want to be in? (Answer must be only letters and numbers, no spaces) Enter nothing to go to welcome."
        );
      }
      // Welcome channel for users that don't enter anything.
      if (myChannel == "") {
        myChannel = "welcome";
      }
    } else {
      myChannel = channelurl;
    }
    // Trim and replace whitespace.
    return promptinput.trim().replace(/\s/g, "");
  }
}

// Stuff that needs to be running constantly

// Set typingtimer to a large number to prevent initial 'user is typing'
var typingtime = 3000;
var font = "Poppins";
var timesincemessage = 4000;
setInterval(() => {
  timesincemessage += 50;
  // Increment typing timer.
  typingtime += 50;
  if (typingtime > 1000 && typing.includes(myName)) {
    // Remove me if I stop typing
    removetyper(myName);
  }
  if (typingtime < 1000 && !typing.includes(myName)) {
    // Add when user types.
    addtyper(myName);
  }
  blurdelete();
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
  document.getElementById(
    "me"
  ).innerHTML = `Sending messages as ${myName.replace(
    /-/g,
    "&#8209;"
  )} in <a href='${url()}'>${HtmlSanitizer.SanitizeHtml(myChannel)}</a>`;
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

// If there are unread messages put them in the header.

var unread = null;
window.onblur = function () {
  // This actually resets the header. See the setInterval function later.
  unread = document.querySelectorAll("li").length;
};
// Reset header onblur and onfocus.
window.onfocus = function () {
  unread = document.querySelectorAll("li").length;
};

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
  output = output.replace(/\/bearhug/g, "ʕっ•ᴥ•ʔっ");

  output = output.replace(/\/bear/g, "ʕ·͡ᴥ·ʔ");
  output = output.replace(/\/imposter/g, "ඞඞ");
  output = output.replace(/\/bearflip/g, "ʕノ•ᴥ•ʔノ ︵ ┻━┻");
  output = output.replace(/\/fancy/g, "**•.¸♥¸.•*");
  // This one is actually usefull for making line breaks
  output = output.replace(/\\n/g, "\n");
  output = output.replace(/\\\n/g, "\\n");
  output = output.replace(/\\t/g, "  ");
  return output;
}

function playsound(
  url = "https://proxy.notificationsounds.com/notification-sounds/me-too-603/download/file-sounds-1144-me-too.mp3"
) {
  if (window.localStorage.getItem("sounds") === "true") {
    // Play the sound, if no argument is given play the message sound.
    var audio = new Audio(url);
    audio.play();
  }
}

function updatedates() {
  // This function runs through all the list items and updates the date on them.
  var dates = document.querySelectorAll("ul li span#message-date");
  for (let i = 0; i < dates.length; i++) {
    const el = dates[i];
    if (formatted_date(el.getAttribute("data-date")) !== el.innerText) {
      // Only update if it's different. Prevents inspect element from going crazy.
      el.innerText = formatted_date(el.getAttribute("data-date"));
    }
  }
}

function updatemessage(thing) {
  // Focus on the message that you're editing.
  thing.focus();
  if (
    thing
      .querySelector("#message-sender")
      .innerText.replace("Delete", "")
      .replace("\n", "") === myName
  ) {
    // Get the actual messageid.
    var messageid = thing.id.replace(/^message-/, "");
    if (
      document.activeElement !== thing.querySelector("#message-text") &&
      document.activeElement.tagName !== "BUTTON" &&
      document.activeElement.tagName !== "LI" &&
      clicktarget === thing
    ) {
      thing
        .querySelector("#message-text")
        .setAttribute("contenteditable", "true");
      thing.querySelector("#message-text").innerText = tomarkdown(
        thing.querySelector("#message-text").innerHTML
      );
    }
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
    .ref("channels/channel-" + myChannel)
    .child(message)
    .update({
      sender: escape(myName),
      message: HtmlSanitizer.SanitizeHtml(html(emotes(newtext))),
      time: time(),
      channel: myChannel
    });
}
function sanitize(message) {
  var text = document
    .getElementById("message-" + message)
    .querySelector("#message-text").innerHTML;
  if (text !== HtmlSanitizer.SanitizeHtml(text)) {
    firebase
      .database()
      .ref("channels/channel-" + myChannel)
      .child(message)
      .update({
        message: HtmlSanitizer.SanitizeHtml(text)
      });
  }
}
// Quote
function quote(el) {
  // Quote a message and add "\n\n" to it to escape the <blockquote>
  document.getElementById("message").value += `>${el.parentElement.querySelector("#message-text").innerText
    }\\n\\n`;
}

function blurdelete() {
  // Unfocus delted messages and stop them from being edited.
  var items = document.querySelectorAll(
    'ul li #message-text[contenteditable="true"]'
  );
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.innerText === "*Deleted*") {
      item.setAttribute("contenteditable", "false");
      item.innerHTML = "<i>Deleted</i>";
      item.blur();
    }
  }
}

function url() {
  // Return the url of the channel.
  return `https://${window.location.hostname}/?channel=${myChannel}`;
}
var DEBUG = true;
if (!DEBUG) {
  if (!window.console) window.console = {};
  var methods = ["log", "debug", "warn", "info"];
  for (var i = 0; i < methods.length; i++) {
    console[methods[i]] = function () { };
  }
}

function tomarkdown(text) {
  // Thanks to GrahamSH for lots of help here! :)
  var converter = new showdown.Converter({
    backslashEscapesHTMLTags: true,
    simplifiedAutoLink: true,
    tables: true
  });

  // GitHub like markdown
  showdown.setFlavor("github");
  // Finally actually use markdown
  var output = converter.makeMarkdown(text);
  return output;
}

function replaceaudio(text) {
  // Play audio that is sent. Originally intended to replace audio urls with <audio> tags.
  var match = text.match(/(https|http):\/\/[\S]+.[\S]+.mp3/);
  console.log(match);
  playsound(match[0]);
}

// Typing database.
var typing = [];
var typingids = [];
var typingchannels = [];

firebase
  .database()
  .ref("typing")
  .on("child_added", function (snapshot) {
    if (snapshot.val().channel === myChannel) {
      typing.push(snapshot.val().user);
      typingids.push(snapshot.key);
    }
  });

firebase
  .database()
  .ref("typing")
  .on("child_removed", function (snapshot) {
    typing = removeitem(snapshot.val().user, typing);
    typingids = removeitem(snapshot.key, typingids);
  });

function addtyper(user) {
  if (
    !typing.includes(user) &&
    window.localStorage.getItem("showtyping") === "true"
  )
    firebase.database().ref("typing").push().set({
      user: user,
      channel: myChannel
    });
}

function removetyper(user) {
  if (window.localStorage.getItem("showtyping") === "true") {
    firebase
      .database()
      .ref("typing")
      .child(typingids[typing.indexOf(user)])
      .remove();
  }
}

window.onload = (e) => {
  removetyper(myName);
};

// Emojis!!!
var map = {
  ">:(": "😠",
  "<3": "\u2764\uFE0F",
  "</3": "\uD83D\uDC94",
  ":D": "😁",
  ":((": "🥺",
  ":)": "\uD83D\uDE03",
  ";)": "\uD83D\uDE09",
  ":(": "\uD83D\uDE12",
  ":p": "\uD83D\uDE1B",
  ";p": "\uD83D\uDE1C",
  ":'(": "\uD83D\uDE22",
  ":')": "😂",
  ":O": "😮",
  ":-*": "😘",
  ":\\": "😕",
  ":/": "😕",
  ">:/": "🤔",
  "-_-": "😑",
  "*<|:‑)": "🎅",
  "(>_<)": "😣",
  ">_<": "😣",
  XD: "😆",
  ":|": "😬"
};

function escapeSpecialChars(regex) {
  // Escape stuff.
  return regex.replace(/([()[{*+.$^\\|?])/g, "\\$1");
}

function emojisfrom(text) {
  // Run through emoji list and replace them.
  var output = text;
  for (var i in map) {
    var regex = new RegExp(escapeSpecialChars(i), "gim");
    output = output.replace(regex, map[i]);
  }
  return output;
}

// System message when window closes.
window.addEventListener("beforeunload", function (e) {
  if (window.localStorage.getItem("leavejoin") === "true") {
    system_msg(`${myName} disconnected`);
  }
});

// Reset typingtimer onkeypress.
document.getElementById("message").onkeypress = (e) => {
  typingtime = 0;
};

var ipbanned = [];

// Update on user add
firebase
  .database()
  .ref("ipbanned")
  .on("child_added", function (snapshot) {
    ipbanned.push(snapshot.val().user);
  });

function isbanned(user) {
  // Test if user exists by checking in the local array made from firebase data
  if (ipbanned.includes(user)) {
    return true;
  } else {
    return false;
  }
}

function banuser(user) {
  firebase.database().ref("ipbanned").push().set({
    user: user
  });
}
setInterval(function () {
  if (myName !== null && ip !== null) {
    if (isbanned(ip)) {
      alert("You are ip banned.");
      window.location.href = "about:blank";
    }
  }
}, 100);

function text(url) {
  return fetch(url).then((res) => res.text());
}
var ip = null;
text("https://www.cloudflare.com/cdn-cgi/trace").then((data) => {
  let ipRegex = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/;
  ip = data.match(ipRegex)[0];
});

var _342958346dfkjhsdfdalkj31f = [];
fetch("https://cdn.jsdelivr.net/npm/badwords@1.0.0/array.js").then(function (
  response
) {
  response.text().then(function (text) {
    _342958346dfkjhsdfdalkj31f = text
      .replace('module.exports = ["', "")
      .replace('"];', "")
      .replace(/", "/g, " ")
      .split(" ");
  });
});
fetch("https://cdn.jsdelivr.net/npm/badwords@1.0.0/array.js").then(function (
  response
) {
  response.text().then(function (text) {
    var newwords = text.split("\n");
    for (let i = 0; i < newwords.length; i++) {
      _342958346dfkjhsdfdalkj31f.push(newwords[i]);
    }
  });
});
// Bad words
function badwords(text) {
  text = text
    .toLowerCase()
    .replace(/[^0-9a-z ]/gi, "")
    .split(" ");
  for (let i = 0; i < text.length; i++) {
    const word = text[i];
    if (_342958346dfkjhsdfdalkj31f.includes(word)) {
      return true;
    }
  }
  return false;
}