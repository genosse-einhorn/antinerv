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
  return elem && !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
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


// google cookie wall on search page
if (window.location.hostname == "www.google.com") {
  RunMultiTimes(function() {
        // old version
        var t = FindVisibleElByTextNode(document, "div", "Bevor Sie zur Google Suche weitergehen");
        if (t) {
            var p = t.parentNode.parentNode.parentNode;

            var b = FindElByInnerText(p, "button", "Ich stimme zu");
            if (b) {
                console.log("AntiNerv: Akzeptiere Google Cookies");
                b.click();
            }
        }

        // new version (occasionally appearing since 07/2021 for me)
        var t = FindVisibleElByTextNode(document, "h1", "Bevor Sie zur Google Suche weitergehen");
        if (t) {
            var p = t.parentNode.parentNode.parentNode;

            var b = FindElByInnerText(p, "button", "Ich stimme zu");
            if (b) {
                console.log("AntiNerv: Akzeptiere Google Cookies");
                b.click();
            }
        }

        // another new version (since 06/2022 for me)
        var t = FindVisibleElByTextNode(document, "h1", "Bevor Sie zu Google weitergehen");
        if (t) {
            var p = t.parentNode.parentNode.parentNode;

            var b = FindElByInnerText(p, "button", "Alle ablehnen");
            if (b) {
                console.log("AntiNerv: Lehne Google Cookies ab");
                b.click();
            }
        }
  }, 100, 50);
}

// google separate consent wall
if (window.location.hostname == "consent.google.com" || window.location.hostname == "consent.google.de") {
    RunMultiTimes(function() {
        var b = FindElByAriaLabel(document, "button", "In die Verwendung von Cookies und anderen Daten zu den beschriebenen Zwecken einwilligen");
        if (b) {
            console.log("AntiNerv: Akzeptiere Google Cookies");
            b.click();
        }
    }, 100, 50);

    // new version (since 07/2022 for me)
    var t = FindVisibleElByTextNode(document, "h1", "Bevor Sie zu Google weitergehen");
    if (t) {
        var p = t.parentNode.parentNode.parentNode;

        var b = FindElByInnerText(p, "button", "Alle ablehnen");
        if (b) {
            console.log("AntiNerv: Lehne Google Cookies ab");
            b.click();
        }
    }
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
        t = b.querySelector("div[aria-checked=\"true\"]");
        if (t) {
          t.click();
        }
      }
    }, 1000, 20);

    // consent wall v2
    RunMultiTimes(function() {
      var b = FindElByAriaLabel(document, "tp-yt-paper-button", "In die Verwendung von Cookies und anderen Daten zu den beschriebenen Zwecken einwilligen");
      if (b && IsElementVisible(b)) {
        console.log("AntiNerv: YouTube consent v2");
        b.click();
      }
    }, 100, 50);

    // consent wall v3
    RunMultiTimes(function() {
      var b = FindElByAriaLabel(document, "tp-yt-paper-button", "Verwendung von Cookies und anderen Daten zu den beschriebenen Zwecken ablehnen");
      if (b && IsElementVisible(b)) {
        console.log("AntiNerv: YouTube consent v3");
        b.click();
      }
    }, 100, 50);

    // consent wall v3.1
    RunMultiTimes(function() {
      var b = FindElByAriaLabel(document, "button", "Verwendung von Cookies und anderen Daten zu den beschriebenen Zwecken ablehnen");
      if (b && IsElementVisible(b)) {
        console.log("AntiNerv: YouTube consent v3.1");
        b.click();
      }
    }, 100, 50);
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

    // new version (since 07/2022 for me)
    var t = FindVisibleElByTextNode(document, "h1", "Bevor Sie zu YouTube weitergehen");
    if (t) {
        var p = t.parentNode.parentNode.parentNode;

        var b = FindElByInnerText(p, "button", "Alle ablehnen");
        if (b) {
            console.log("AntiNerv: Lehne YouTube Cookies ab");
            b.click();
        }
    }
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
    var c = document.querySelectorAll("#sidebar .btn-close");
    for (var i = 0; i < c.length; ++i) {
      if (IsElementVisible(c[i])) {
        console.log("AntiNerv: OSM banner");
        c[i].click();
      }
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

// reddit over 18
if (window.location.href.startsWith("https://old.reddit.com/over18")) {
    var b = document.querySelector("button[name=\"over18\"][value=\"yes\"]")
    if (b) {
        b.click();
    }
}

// old reddit
if (window.location.href.startsWith("https://www.reddit.com/r/")
  || window.location.href.startsWith("https://www.reddit.com/u")) {
    console.log("neues reddit gefunden!");
    window.location.replace("https://old.reddit.com" + window.location.href.substr(22));
}

// twitter
if (window.location.href.startsWith("https://twitter.com")
        || window.location.href.startsWith("https://mobile.twitter.com")
        || window.location.href.startsWith("https://www.twitter.com")) {
    console.log("AntiNerv: Twitter gefunden");

    // login wall
    setInterval(function() {
        if (document.querySelector("html").style.overflow == "hidden") {
            console.log("AntiNerv: Modales PopUp gefunden");

            document.querySelector("html").style.removeProperty("overflow");

            var d = document.querySelector("div[data-testid=\"sheetDialog\"]");
            if (d.innerText.match(/\nAnmelden\n(Du hast noch keinen Account\? )?Registrieren$/)) {
                d.parentNode.remove();
            }
        }
    }, 2000);

    // cookie annoyance
    RunMultiTimes(function() {
        var bs = document.querySelectorAll("div[role=\"button\"]");
        for (var i = 0; i < bs.length; ++i) {
            var b = bs[i];
            var c = FindVisibleElByTextNode(b, "span", "Unwesentliche Cookies ablehnen");
            if (c) {
                c.click();
            }
        }
    }, 100, 100);
}

// microsoft docs
if (window.location.href.startsWith("https://docs.microsoft.com/de-de/")) {
    console.log("AntiNerv: deutsches MSDN gefunden");

    RunMultiTimes(function() {
        var l = document.querySelector("a.button[title=\"Auf Englisch lesen\"]");
        if (l) {
            console.log("wechsle zu englischer Seite");
            l.click();
        }
    }, 100, 100);
}

// kleinanzeigen
if (window.location.href.startsWith("https://www.kleinanzeigen.de/")) {
    // Alte Version
    RunMultiTimes(function() {
        var x = document.querySelector(".login-overlay .j-overlay-close");
        if (IsElementVisible(x)) {
            console.log("ebay kleinanzeigen: verstecke login-overlay");
            x.click();
        }
    }, 100, 100);

    // Neue Version (min. seit 06/2025)
    RunMultiTimes(function() {
        var x = FindElByAriaLabel(document, 'button', 'Willkommens-Popup Schließen');
        if (IsElementVisible(x)) {
            console.log("ebay kleinanzeigen: verstecke login-overlay v2");
            x.click();
        }
    }, 100, 100);
}

// login mit google
RunMultiTimes(function() {
    var x = document.querySelector('iframe[title="Dialogfeld „Über Google anmelden“"]');
    if (IsElementVisible(x)) {
        console.log("verstecke google login");
        x.parentElement.remove();
    }
}, 100, 100);

// ebay
if (window.location.href.startsWith("https://www.ebay.de/")) {
    // login mit google
    RunMultiTimes(function() {
        var x = FindElByAriaLabel(document, "div", 'eBay mit Google nutzen');
        if (IsElementVisible(x)) {
            console.log("verstecke google login");
            x.parentElement.remove();
        }
    }, 100, 100);

    // cookies
    RunMultiTimes(function() {
        var x = FindElByAriaLabel(document, 'button', 'Alle Datenschutzbestimmungen und Einstellungen ablehnen');
        if (IsElementVisible(x)) {
            console.log("lehne cookies ab");
            x.click();
        }
    }, 100, 100);
}
