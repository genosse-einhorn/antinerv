// ==UserScript==
// @name     AntiNerv
// @version  1
// @grant    none
// @run-at	 document-idle
// ==/UserScript==


// run multi times helper
function RunMultiTimes(func, interval, count) {
  var c = 0;
  var r = function() {
  func();
    if (c < count) {
      c++;
      setTimeout(r, interval);
    }
  }

  r();
}


function IsElementVisible(elem) {
  return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
}

function FindElByTextNode(parent, tagname, text) {
  var els = parent.getElementsByTagName(tagname);
  for (var i = 0; i < els.length; ++i) {
    if (els[i].firstChild && els[i].firstChild.nodeType == 3 && els[i].firstChild.textContent == text) {
      return els[i];
    }
  }

  return null;
}

function FindVisibleElByTextNode(parent, tagname, text) {
  var els = parent.getElementsByTagName(tagname);
  for (var i = 0; i < els.length; ++i) {
    if (IsElementVisible(els[i]) && els[i].firstChild && els[i].firstChild.nodeType == 3 && els[i].firstChild.textContent == text) {
      return els[i];
    }
  }

  return null;
}

function FindElByInnerText(parent, tagname, text) {
  var els = parent.getElementsByTagName(tagname);
  for (var i = 0; i < els.length; ++i) {
    if (els[i].innerText == text) {
      return els[i];
    }
  }

  return null;
}

function FindElByAriaLabel(parent, tagname, label) {
  var els = parent.getElementsByTagName(tagname);
  for (var i = 0; i < els.length; ++i) {
    if (els[i].getAttribute("aria-label") == label) {
      return els[i];
    }
  }

  return null;
}

function TriggerMouseEvent(node, eventType) {
    var e = document.createEvent('MouseEvents');
    e.initEvent(eventType, true, true);
    node.dispatchEvent(e);
}

function FakeClick(node) {
    TriggerMouseEvent(node, "mouseover");
    TriggerMouseEvent(node, "mousedown");
    TriggerMouseEvent(node, "mouseup");
    TriggerMouseEvent(node, "click");
}


// google cookies
if (window.location.hostname == "www.google.com") {
  RunMultiTimes(function() {
    var t = FindVisibleElByTextNode(document, "div", "Bevor Sie zur Google Suche weitergehen");
    if (t) {
      var p = t.parentNode.parentNode.parentNode;

      var b = FindElByInnerText(p, "button", "Ich stimme zu");
      if (b) {
        console.log("AntiNerv: Akzeptiere Google Cookies");
        b.click();
      }
    }
  }, 100, 50);
}

// YouTube
if (window.location.hostname == "www.youtube.com") {
  // XXX: YouTube occasionally does shit when it switches the URL without reloading
  function yt() {
    // login wall
    RunMultiTimes(function() {
      var d = document.getElementsByTagName("tp-yt-paper-dialog");
      for (var i = 0; i < d.length; ++i) {
        if (d[i].style.display != 'none' && FindVisibleElByTextNode(d[i], "yt-formatted-string", "In YouTube anmelden")) {
          var b = d[i].querySelector('[role="button"][aria-label="Nein danke"]');
          if (b) {
            console.log("AntiNerv: YouTube Anmeldung übersprungen");
            FakeClick(b);
          }
        }
      }
    }, 100, 100);

    // autoplay
    RunMultiTimes(function() {
      var b = FindElByAriaLabel(document, "button", "Autoplay aktiviert");
      if (b) {
        console.log("AntiNerv: YouTube Autoplay deaktiviert");
        b.click();
      }
    }, 1000, 20);
  }

  document.addEventListener("yt-navigate-finish", function() { yt(); } );
  yt();
}

// YouTube consent wall
if (window.location.hostname == "consent.youtube.com") {
  RunMultiTimes(function() {
    var b = FindElByAriaLabel(document, "button", "In die Verwendung von Cookies und anderen Daten zu den beschriebenen Zwecken einwilligen");
    if (b) {
      console.log("AntiNerv: YouTube consent");
      b.click();
    }
  }, 100, 50);
}

// golem
if (window.location.hostname == "www.golem.de") {
  if (FindVisibleElByTextNode(document, "h2", "Cookies zustimmen")) {
    unsafeWindow.eval('GolemConsent.storeConsent("simple");');
  }
}

// wetter.com
if (window.location.hostname == "www.wetter.com") {
  RunMultiTimes(function() {
    document.body.classList.remove("cmp-prevent-scroll");
    var p = document.getElementById("cmp-style-reset");
    if (p) {
      p.remove();
    }
  }, 100, 50);
}

// osm welcome
if (window.location.hostname == "www.openstreetmap.org") {
  setTimeout(function() {
    var c = document.querySelector("#sidebar .welcome .icon.close");
    if (c && IsElementVisible(c)) {
      console.log("AntiNerv: OSM welcome banner");
      c.click();
    }
  }, 500);
}

// zeit.de
if (window.location.hostname == "www.zeit.de") {
    RunMultiTimes(function() {
        var d = document.querySelector(".consent");
        if (d && IsElementVisible(d)) {
            var b = FindVisibleElByTextNode(d, "button", "Einverstanden");
            if (b) {
                b.click();
            }
        }
    }, 100, 100);

    RunMultiTimes(function() {
        var f = document.querySelector(".paywall-footer");
        if (f) {
            var c = FindElByAriaLabel(f, "button", "schließen");
            if (c) {
                c.click();
            }
        }
    }, 100, 100);
}
