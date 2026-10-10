/*  Harmoni: script.js
    -----------------------------------------------------------------
    Uses only what we have covered (Nixon, chapters 13 and 14):
      variables, strings, numbers, operators, string concatenation,
      functions, arrays (new Array() + indexes), if / else, switch,
      the ternary operator ?:, for and while loops, break / continue,
      try...catch, parseInt(), toUpperCase(), the onclick event,
      and the DOM (getElementById, .value, .checked, innerHTML).
*/


/* =================================================================
   DATA
   Each kind of thing (songs, services, ...) is stored as a set of
   "parallel arrays": song number j has its title in songTitles[j],
   its artist in songArtists[j], and so on.
   ================================================================= */

// ---- Songs ----
var songTitles    = new Array();
var songArtists   = new Array();
var songParts     = new Array();   // e.g. "Soprano, Alto, Tenor"
var songStatuses  = new Array();   // "New", "Rehearsing" or "Archived"
var songKeys      = new Array();
var songRehearsal = new Array();   // when it is next rehearsed
var songNotes     = new Array();
var songCount     = 0;

// ---- Services ----
var serviceDays       = new Array();
var serviceMonths     = new Array();
var serviceNames      = new Array();
var serviceTimes      = new Array();
var serviceRegistered = new Array();   // true or false
var serviceCount      = 0;

// ---- Announcements ----
var newsTitles    = new Array();
var newsBodies    = new Array();
var newsCategory  = new Array();
var newsAuthors   = new Array();
var newsImportant = new Array();   // true or false
var newsCount     = 0;

// ---- What the user has chosen ----
var myPart        = "Soprano";
var libraryFilter = "all";
var openSongIndex = -1;    // which song is open in detail view (-1 = none)


/* =================================================================
   SMALL HELPER FUNCTIONS
   ================================================================= */

// Short name for document.getElementById (Example 13-8 in the textbook)
function $(id)
{
  return document.getElementById(id);
}

// Makes typed text safe to put inside innerHTML
function safeText(text)
{
  var result = "";

  for (var j = 0 ; j < text.length ; ++j)
  {
    var c = text.charAt(j);

    switch (c)
    {
      case "<": result += "&lt;";   break;
      case ">": result += "&gt;";   break;
      case "&": result += "&amp;";  break;
      case '"': result += "&quot;"; break;
      default:  result += c;
    }
  }
  return result;
}

// Does "text" contain "word" anywhere? Ignores upper/lower case.
// Example: contains("Way Maker", "maker") is true.
function contains(text, word)
{
  text = text.toUpperCase();
  word = word.toUpperCase();

  // Try every starting position in text...
  for (var start = 0 ; start <= text.length - word.length ; ++start)
  {
    var match = true;

    // ...and check each letter of word against text
    for (var k = 0 ; k < word.length ; ++k)
    {
      if (text.charAt(start + k) != word.charAt(k))
      {
        match = false;
        break;          // one letter is different, so stop checking here
      }
    }

    if (match) return true;
  }
  return false;
}

// Writes a message into an <output> element and colours it ("ok" or "error")
function showMessage(id, html, type)
{
  $(id).innerHTML = html;
  $(id).className = type;
}

// Builds a coloured status badge, e.g. <span class="badge rehearsing">Rehearsing</span>
function badge(status)
{
  var css;

  switch (status)
  {
    case "New":        css = "new";        break;
    case "Rehearsing": css = "rehearsing"; break;
    case "Archived":   css = "archived";   break;
    default:           css = "";
  }
  return '<span class="badge ' + css + '">' + status + "</span>";
}


/* =================================================================
   SCREENS AND TABS
   Only one <section class="screen"> is visible at a time.
   ================================================================= */

var screenNames = new Array("home", "songs");

function showScreen(name)
{
  for (var j = 0 ; j < screenNames.length ; ++j)
  {
    var isThisOne = (screenNames[j] == name);

    $(screenNames[j]).className          = isThisOne ? "screen" : "screen hidden";
    $("tab-" + screenNames[j]).className = isThisOne ? "tab active" : "tab";
  }

  // Opening the Songs tab always starts on the list, not on an old song
  if (name == "songs") closeSong();

  window.scrollTo(0, 0);
}


/* =================================================================
   HOME SCREEN
   ================================================================= */

function changePart()
{
  myPart = $("my-part").value;
  updateAll();
}

function toggleRegistration(j)
{
  serviceRegistered[j] = !serviceRegistered[j];   // true becomes false, false becomes true
  drawServices();
}

function drawServices()
{
  var rows = "";
  var registered = 0;

  for (var j = 0 ; j < serviceCount ; ++j)
  {
    if (serviceRegistered[j]) ++registered;

    var buttonText  = serviceRegistered[j] ? "Registered ✓" : "Register";
    var buttonClass = serviceRegistered[j] ? "small registered" : "small";

    rows += "<tr>";
    rows += '<td class="date"><strong>' + serviceDays[j] + "</strong><br>" + serviceMonths[j] + "</td>";
    rows += "<td><strong>" + serviceNames[j] + '</strong><br><span class="muted">' + serviceTimes[j] + "</span></td>";
    rows += '<td><button type="button" class="' + buttonClass + '" onclick="toggleRegistration(' + j + ')">' + buttonText + "</button></td>";
    rows += "</tr>";
  }

  $("services-body").innerHTML   = rows;
  $("services-caption").innerHTML = "You are registered for " + registered + " of " + serviceCount + " services";
}

// Shows up to 3 songs for my voice part that are not archived
function drawHomeSongs()
{
  var cards = "";
  var shown = 0;

  for (var j = 0 ; j < songCount ; ++j)
  {
    if (songStatuses[j] == "Archived") continue;
    if (!contains(songParts[j], myPart)) continue;

    cards += songCard(j);
    ++shown;
    if (shown == 3) break;    // three is enough for the home screen
  }

  if (shown == 0) cards = '<p class="empty">No songs for ' + myPart + " yet.</p>";
  $("home-songs").innerHTML = cards;
}

// Shows the 2 newest announcements
function drawHomeNews()
{
  var cards = "";
  var shown = 0;
  var j = newsCount - 1;      // start from the newest

  while (j >= 0 && shown < 2)
  {
    cards += newsCard(j);
    ++shown;
    --j;
  }

  $("home-news").innerHTML = cards;
}


/* =================================================================
   SONG LIBRARY
   ================================================================= */

// Stores one song and returns its number
function addSong(title, artist, parts, status, key, rehearsal, notes)
{
  var j = songCount;

  songTitles[j]    = title;
  songArtists[j]   = artist;
  songParts[j]     = parts;
  songStatuses[j]  = status;
  songKeys[j]      = key;
  songRehearsal[j] = rehearsal;
  songNotes[j]     = notes;

  ++songCount;
  return j;
}

// The HTML for one song card (used on Home and in the Library)
function songCard(j)
{
  var html = '<button type="button" class="song-card" onclick="openSong(' + j + ')">';
  html += '<span class="song-icon" aria-hidden="true">♪</span>';
  html += '<span class="song-info">';
  html +=   '<span class="song-title">' + safeText(songTitles[j]) + "</span>";
  html +=   '<span class="song-artist">' + safeText(songArtists[j]) + "</span>";
  html +=   '<span class="song-meta">' + badge(songStatuses[j]) + " " + partChips(songParts[j]) + "</span>";
  html += "</span></button>";
  return html;
}

// Turns "Soprano, Alto, Tenor" into little chips, highlighting my part
function partChips(parts)
{
  var allParts = new Array("Soprano", "Alto", "Tenor", "Bass");
  var html = "";

  for (var j = 0 ; j < allParts.length ; ++j)
  {
    if (!contains(parts, allParts[j])) continue;

    var css = (allParts[j] == myPart) ? "part mine" : "part";
    html += '<span class="' + css + '">' + allParts[j] + "</span> ";
  }
  return html;
}

function setFilter(name)
{
  libraryFilter = name;

  var filterNames = new Array("all", "mine", "rehearsing", "new");
  for (var j = 0 ; j < filterNames.length ; ++j)
    $("filter-" + filterNames[j]).className = (filterNames[j] == name) ? "chip active" : "chip";

  drawLibrary();
}

// Should song j appear with the current filter and search?
function songMatches(j)
{
  var search = $("search").value;

  switch (libraryFilter)
  {
    case "mine":
      if (!contains(songParts[j], myPart) || songStatuses[j] == "Archived") return false;
      break;
    case "rehearsing":
      if (songStatuses[j] != "Rehearsing") return false;
      break;
    case "new":
      if (songStatuses[j] != "New") return false;
      break;
  }

  // An empty search matches everything
  if (search == "") return true;
  return contains(songTitles[j], search) || contains(songArtists[j], search);
}

function drawLibrary()
{
  var cards = "";
  var shown = 0;

  for (var j = 0 ; j < songCount ; ++j)
  {
    if (!songMatches(j)) continue;
    cards += songCard(j);
    ++shown;
  }

  if (shown == 0) cards = '<p class="empty">No songs match. Try another filter or search.</p>';

  $("song-list").innerHTML     = cards;
  $("library-count").innerHTML = shown + (shown == 1 ? " song" : " songs");
}

// Runs when the "Add song" form is submitted
function addSongFromForm()
{
  try
  {
    var title     = $("song-title").value;
    var artist    = $("song-artist").value;
    var key       = $("song-key").value;
    var rehearsal = $("song-rehearsal").value;
    var notes     = $("song-notes").value;
    var status    = $("status-rehearsing").checked ? "Rehearsing" : "New";

    // Build "Soprano, Alto, Tenor" from the ticked checkboxes
    var boxes = new Array("part-soprano", "part-alto", "part-tenor", "part-bass");
    var parts = "";
    for (var j = 0 ; j < boxes.length ; ++j)
    {
      if ($(boxes[j]).checked)
        parts += (parts == "" ? "" : ", ") + $(boxes[j]).value;
    }

    // Second safety net after the browser's own checks
    if (title.length < 2 || artist == "")
    {
      showMessage("song-message", "Please enter the title and the artist.", "error");
      return false;
    }
    if (parts == "")
    {
      showMessage("song-message", "Tick at least one voice part.", "error");
      return false;
    }

    addSong(title, artist, parts, status, key, rehearsal, notes);
    showMessage("song-message", "<strong>" + safeText(title) + "</strong> was added to the library.", "ok");

    $("song-form").reset();
    updateAll();
  }
  catch (err)
  {
    showMessage("song-message", "Something went wrong: " + err.message, "error");
  }

  return false;   // stop the page from reloading
}


/* =================================================================
   SONG DETAIL
   ================================================================= */

function openSong(j)
{
  // Make sure we are on the Songs screen (this also closes any old song)...
  if ($("songs").className != "screen") showScreen("songs");

  // ...then swap the list for the detail view
  openSongIndex = j;

  $("library-view").className = "hidden";
  $("song-detail").className  = "";
  drawSongDetail();
  window.scrollTo(0, 0);
}

function closeSong()
{
  openSongIndex = -1;
  $("library-view").className = "";
  $("song-detail").className  = "hidden";
}

function changeStatus()
{
  songStatuses[openSongIndex] = $("detail-status").value;
  updateAll();
  showMessage("detail-message", "Status changed to " + songStatuses[openSongIndex] + ".", "ok");
}

function drawSongDetail()
{
  if (openSongIndex == -1) return;

  var j = openSongIndex;
  var keyText       = (songKeys[j] == "")      ? "Not set" : songKeys[j];
  var rehearsalText = (songRehearsal[j] == "") ? "Not scheduled yet" : safeText(songRehearsal[j]);
  var notesText     = (songNotes[j] == "")     ? "No notes yet." : safeText(songNotes[j]);
  var singsIt       = contains(songParts[j], myPart);

  // Search links: the + signs become spaces in the search box
  var searchWords = safeText(songTitles[j] + " " + songArtists[j]);

  var html = "";
  html += '<p><button type="button" class="secondary small" onclick="closeSong()">&larr; Back to library</button></p>';
  html += '<p class="detail-icon" aria-hidden="true">♪</p>';
  html += "<h1>" + safeText(songTitles[j]) + "</h1>";
  html += '<p class="song-artist">' + safeText(songArtists[j]) + "</p>";
  html += "<p>" + badge(songStatuses[j]) + " " + partChips(songParts[j]) + "</p>";

  if (!singsIt)
    html += '<p class="muted">Your part (' + myPart + ") is not in this arrangement.</p>";

  html += '<p class="notes">' + notesText + "</p>";

  // Lesson 3: a description list for the song's facts
  html += '<dl class="facts">';
  html += "<dt>Key</dt><dd>" + keyText + "</dd>";
  html += "<dt>Next rehearsal</dt><dd>" + rehearsalText + "</dd>";
  html += "</dl>";

  // Lesson 4: links that open in a new tab
  html += "<h2>Practise with</h2>";
  html += '<ul class="resources">';
  html += '<li><a href="https://www.youtube.com/results?search_query=' + searchWords + '" target="_blank" rel="noopener">Watch on YouTube</a></li>';
  html += '<li><a href="https://www.google.com/search?q=' + searchWords + ' lyrics" target="_blank" rel="noopener">Find the lyrics</a></li>';
  html += "</ul>";

  // Music directors can move a song along: New -> Rehearsing -> Archived
  html += '<p class="status-row"><label for="detail-status">Change status</label>';
  html += '<select id="detail-status">';
  html += '<option' + (songStatuses[j] == "New"        ? " selected" : "") + ">New</option>";
  html += '<option' + (songStatuses[j] == "Rehearsing" ? " selected" : "") + ">Rehearsing</option>";
  html += '<option' + (songStatuses[j] == "Archived"   ? " selected" : "") + ">Archived</option>";
  html += '</select> <button type="button" class="small" onclick="changeStatus()">Save</button></p>';
  html += '<p><output id="detail-message" aria-live="polite"></output></p>';

  $("song-detail").innerHTML = html;
}


/* =================================================================
   ANNOUNCEMENTS (shown on the Home screen)
   ================================================================= */

function addNews(title, body, category, author, important)
{
  newsTitles[newsCount]    = title;
  newsBodies[newsCount]    = body;
  newsCategory[newsCount]  = category;
  newsAuthors[newsCount]   = author;
  newsImportant[newsCount] = important;
  ++newsCount;
}

function newsCard(j)
{
  var html = newsImportant[j] ? '<article class="news important">' : '<article class="news">';
  html += '<p class="news-cat">' + (newsImportant[j] ? '<span class="dot"></span>' : "") + newsCategory[j] + "</p>";
  html += "<h3>" + safeText(newsTitles[j]) + "</h3>";
  html += "<p>" + safeText(newsBodies[j]) + "</p>";
  html += '<p class="muted">' + safeText(newsAuthors[j]) + "</p>";
  html += "</article>";
  return html;
}

/* =================================================================
   REDRAW EVERYTHING
   ================================================================= */

function updateAll()
{
  drawServices();
  drawHomeSongs();
  drawHomeNews();
  drawLibrary();
  drawSongDetail();
}


/* =================================================================
   STARTING DATA (from the Harmoni prototype)
   ================================================================= */

addSong("Believe for It",  "CeCe Winans",      "Soprano, Alto, Tenor", "Rehearsing", "",   "Thu 15 Oct, 7:00 PM",
        "A powerful declaration of faith. Take the modulation into the bridge slowly and let the descant sit on top without pushing.");
addSong("Way Maker",       "Sinach",           "Soprano, Alto, Tenor", "New",        "B♭", "Tue 20 Oct, 7:00 PM",
        "Anthem of worship. Keep the verses intimate, then open fully on the chorus.");
addSong("Imela",           "Nathaniel Bassey", "Soprano, Alto, Tenor", "Rehearsing", "",   "Thu 15 Oct, 7:00 PM",
        "Igbo for \"thank you\". Rich four-part harmony, so mind the tenor entries.");
addSong("Onwanwani",       "Joe Mettle",       "Soprano, Alto, Tenor", "New",        "",   "Thu 22 Oct, 7:00 PM",
        "Highlife-inflected praise. Feel the groove; the claps land on 2 and 4.");
addSong("I Know Who I Am", "Sinach",           "Soprano, Alto, Tenor", "Rehearsing", "",   "Sun 18 Oct, 7:00 PM",
        "Testimony song. Build dynamics gradually to the final chorus.");
addSong("Ebenezer",        "Nii Okai",         "Soprano, Alto",        "Archived",   "",   "",
        "A song of remembrance and gratitude. Archived after the Easter service.");

serviceDays[0] = "11"; serviceMonths[0] = "Oct"; serviceNames[0] = "Sunday Worship";    serviceTimes[0] = "8:00 AM · Main Sanctuary"; serviceRegistered[0] = true;
serviceDays[1] = "18"; serviceMonths[1] = "Oct"; serviceNames[1] = "Communion Service"; serviceTimes[1] = "8:00 AM · Main Sanctuary"; serviceRegistered[1] = false;
serviceDays[2] = "23"; serviceMonths[2] = "Oct"; serviceNames[2] = "Worship Night";     serviceTimes[2] = "6:00 PM · Auditorium";     serviceRegistered[2] = false;
serviceCount = 3;

// Added oldest first; drawHomeNews() starts from the last one, so the newest shows first
addNews("Worship Night volunteers needed", "We need 4 volunteers for setup and 2 for the tech team. Reply in the Heads chat if you are available.", "Event", "Yaw Darko", false);
addNews("New song added: Way Maker", "Sinach's Way Maker is now in the library. Sopranos start on the descant this week.", "Announcement", "Adwoa Sarpong", false);
addNews("Sunday call time is 6:45 AM", "Please arrive 15 minutes early for the pre-service sectional. We run Believe for It and Way Maker before the congregation arrives.", "Rehearsal", "Kwame Mensah", true);

updateAll();
