// by @therealtakeshi
// Setting up the options for localStorage;
var toStore = {
    emo:false,
    heart:false,
    sounds:false,
    msgLimit:false,
    msgAllowed:200,
    colorUsername:"#D18026",
    colorActive:"#27AE60",
    colorInactive:"#C0392B"
};

// Puts the options in the localStorage;
// if(!localStorage.getItem('jefflr')) {
    // Note the stringify (localStorage only accepts strings);
    localStorage.setItem('jefflr',JSON.stringify(toStore));
// }

// Keeps it easy to access localStorage;
var opts = function () {
    JSON.parse(localStorage.getItem('jefflr'));
};

// Allows for colorpicker
var checkBackground = localStorage.getItem('jefflr_opts.colorBackground');
var checkComment = localStorage.getItem('jefflr_opts.colorComment');
if (!checkBackground) setIt('jefflr','colorBackground',"#1E262C");
if (!checkComment) setIt('jefflr','colorComment',"#E0A666");

// Checks for beta and if found, sets beta to true;
// (first self-invoked anon function, woo!);
(function () {
    if (document.getElementById("heading_elements")) {
        beta = true;
    } else beta = false;
})();

// Helper function to set localStorage;
function setIt (table, key, val) {
    var lsNow = JSON.parse(localStorage.getItem(table));
    lsNow[key] = val;
    localStorage.setItem(table,JSON.stringify(lsNow));
}

// Helper function to select element by attribute;
function getElements(attribute) {
    return document.querySelectorAll('[' + attribute + ']');
}

// Helper function to update a given element (by id) with given content;
function elUpdate(element, content) {
  document.getElementById(element).innerHTML = content;
}

// Helper function to play a sound file;
// @see: http://stackoverflow.com/questions/15955183/play-mp3-with-javascript-html5
function playSound(el,soundfile) {
    if (opts.sounds) {
        if (el.wav) {
          if(el.wav.paused) el.wav.play();
          else el.wav.pause();
        } else {
          el.wav = new Audio(soundfile);
          el.wav.play();
        }
    }
}

// Checks if a given element (by id) exists;
function elExists(element) {
    if (typeof (document.getElementById(element)) !== "undefined") {
        return true;
    } else {
        return false;
    }
}

// Helper function returns "off" or "on" instead of true/false;
function boolText(val) {
  if (val) return "ON";
  if (!val) return "OFF";
}

// Toggles the emoticon active state;
function emoToggle() {
    var el = document.getElementById("emo-toggle");
    opts.emo = !opts.emo;
    if (opts.emo) {
        el.style.color = opts.colorActive;
    } else {
        el.style.color = opts.colorInactive;
    }
}

// Adds the emoticons toggle button;
function addEmo() {
    var li = document.createElement('li');
    var element = document.createElement('a');
    li.appendChild(element);
    li.setAttribute("id","emoticons");
    // li.style.color='#b3b3b3';
    // li.style.background=opts.colorBackground;
    // li.style.width='114px';
    // li.style.height='32px';
    element.className = "toolkit_inactive";
    element.setAttribute("id","emo-toggle");
    element.setAttribute("title","Isn't :jeff just such a :luchadeer?");
    element.appendChild(document.createTextNode('EMOTICONS'));
    document.getElementById("nav_first").appendChild(li);

    var a = document.getElementById("emo-toggle");
    if (beta) a.style.width = '120px';
    a.style.color = opts.colorInactive;
    a.onclick = emoToggle;
}

// Toggles the autoheart active state;
function heartToggle() {
    var el = document.getElementById("heart-toggle");
    opts.heart = !opts.heart;
    if (opts.heart) {
        el.style.color = opts.colorActive;
    } else {
        el.style.color = opts.colorInactive;
    }
}

// Adds the autoheart toggle button;
function addHeart() {
    var li = document.createElement('li');
    var element = document.createElement('a');
    li.appendChild(element);
    li.setAttribute("id","autoheart");
    // li.style.color='#b3b3b3';
    // li.style.background='"+JSON.parse(localStorage.getItem('jefflr')).colorBackground+"';
    // li.style.width='114px';
    // li.style.height='32px';
    element.className = "toolkit_inactive";
    element.setAttribute("id","heart-toggle");
    element.setAttribute("title","Only runs when broadcast is active.");
    element.appendChild(document.createTextNode('AUTOHEART'));
    document.getElementById("nav_first").appendChild(li);

    var a = document.getElementById("heart-toggle");
    if (beta) a.style.width = '120px';
    a.style.color = opts.colorInactive;
    a.onclick = heartToggle;
}

// Handles the autoheart logic;
function heart() {
    if (opts.heart) {
        var el = document.getElementsByClassName("action");
        if (typeof el !== 'undefined' && typeof el !== null){
          el[0].click();
        }
    }
}

// Starts the emo function, running every 2.5s;
// First step checks for opts.heart:true, so shouldn't be too expensive;
if (!beta) setInterval(heart,2500);

// Helper function to modify blocked users;
function modUser () {
    var el = document.getElementById("blockUser");
    var val = document.getElementById("blockUser").value;
    var index = arr.user.indexOf(val);
    if (index > -1) {
        arr.user.splice(index, 1);
        el.value = this + "Blocked";
    } else {
        arr.user.push(val);
        el.value = this + "Unblocked";
    }
    window.setTimeout(document.getElementById("blockUser").value = "",1500);
}

// Adds the User blocking;
function addUser() {
    var li = document.createElement('li');
    var element = document.createElement('input');
    li.appendChild(element);
    li.setAttribute("id","li-blockUser");
    element.setAttribute("id","blockUser");
    element.setAttribute("onkeypress","{if (event.keyCode==13) modUser()}");
    element.setAttribute("title","Type username here + Enter to block/unblock");
    document.getElementById("nav_first").appendChild(li);
    document.getElementById("blockUser").setAttribute("placeholder","Username Block/Unblock");
}

// Adds the message limiting;
function addLimit() {
    var li = document.createElement('li');
    var element = document.createElement('a');
    li.appendChild(element);
    li.setAttribute("id","msgLimit");
    element.className = "toolkit_inactive";
    element.setAttribute("id","limit-toggle");
    element.setAttribute("title","Limits the number of messages on-screen. Default: 200");
    element.appendChild(document.createTextNode('MSG LIMIT'));
    document.getElementById("nav_first").appendChild(li);

    var a = document.getElementById("limit-toggle");
    if (beta) a.style.width = '120px';
    if (!beta) a.style.width = '127px';
    a.style.color = opts.colorInactive;
    a.onclick = limitToggle;
}
if (!document.getElementById("limit-toggle")) addLimit();

// Toggles the autoheart active state;
function limitToggle() {
    var el = document.getElementById("limit-toggle");
    opts.msgLimit = !opts.msgLimit;
    if (opts.msgLimit) {
        el.style.color = opts.colorActive;
    } else {
        el.style.color = opts.colorInactive;
    }
}

// Logic for message limiting;
function msgLimit() {
    var selection = $("#comment_list").children().length;
    for (i = selection; i > opts.msgAllowed; i--) {
        $("#comment_list:nth-child(2) > li:nth-child("+i+")").remove();
    }
}

if (beta) {
    // Adding colorpicker
    var spectrum1 = document.createElement('script');
    spectrum1.setAttribute('src','http://bgrins.github.com/spectrum/spectrum.js');
    document.getElementsByTagName('head')[0].appendChild(spectrum1);
    var spectrum2 = document.createElement('link');
    spectrum2.setAttribute('rel','stylesheet');
    spectrum2.setAttribute('src','http://bgrins.github.com/spectrum/spectrum.css');
    document.getElementsByTagName('head')[0].appendChild(spectrum2);
    document.getElementsByClassName('broadcaster_details_sidebar')[0].appendChild(document.createElement('br'));
    var colorpicker = document.createElement('input');
    colorpicker.setAttribute('type','text');
    colorpicker.setAttribute('id','background-picker');
    document.getElementsByClassName('broadcaster_details_sidebar')[0].appendChild(colorpicker);
    $('#background-picker').spectrum({
        color: JSON.parse(localStorage.getItem('jefflr')).colorBackground,
        clickoutFiresChange: true,
        showButtons: false,
        chooseText: "Background",
        preferredFormat: "hex",
        change: function () {
            var color = $('#background-picker').spectrum("get")[0].value;
            setIt('jefflr','colorBackground',color);
            console.log(color);
        }
    });
    var colorpicker2 = document.createElement('input');
    colorpicker2.setAttribute('type','text');
    colorpicker2.setAttribute('id','text-picker');
    document.getElementsByClassName('broadcaster_details_sidebar')[0].appendChild(colorpicker2);
    $('#text-picker').spectrum({
        color: JSON.parse(localStorage.getItem('jefflr')).colorComment,
        clickoutFiresChange: true,
        showButtons: false,
        chooseText: "Text",
        preferredFormat: "hex",
        change: function () {
            var color = $('#text-picker').spectrum("get")[0].value;
            setIt('jefflr','colorComment',color);
            console.log(color);
        }
    });
}

// Instantiate the normalRules var;
var normalRules = "";
// Main broadcaster name;
normalRules += "h1 {color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"}";
// Broadcaster name and broadcast title;
normalRules += "h2 {color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"}";
// Usernames in comment list;
normalRules += "h3 {color: #D18026; font-weight:bold}";
// Header in superfluous header box between comment post box and comment list;
normalRules += "h4 {color: #CCC;}";
//
// Fixes Z-Index problem when screen size is reduced (nav buttons disappear)
// normalRules += "#main_content {z-index:1002;}";
// normalRules += ".fixed_width #main_menu[role='navigation'] {z-index:1003;}";
// Background for the page;
normalRules += "#broadcast_chat {background: url(http://www.bispoke.org/assets/gb/2483078-img_0854.jpg) 50%;background-size:148%}";
//
// Top Mixlr bar;
normalRules += "header#main_header {background:"+JSON.parse(localStorage.getItem('jefflr')).colorBackground+"}";
// Fixes nav index issue;
// normalRules += "#broadcast_wrapper {z-index:10001;}";
// Search input itself;
normalRules += ".fixed_width #main_search {display:none;}";
// Special User block;
normalRules += "#blockUser {-webkit-transition: all 3s ease-in-out;-moz-transition: all 3s ease-in-out;-ms-transition: all 3s ease-in-out;-o-transition: all 3s ease-in-out;transition: all 3s ease-in-out;width: 100%;padding: 7px 12px 5px 12px;font-size: 11px;border-radius: 30px;-moz-border-radius: 30px;-webkit-border-radius: 30px;-ms-border-radius: 30px;-o-border-radius: 30px;behavior: url(/PIE.htc?l1351084804);height: 24px;font-family: 'Lucida$ Sans W01 Roman','Lucida Sans','Lucida Grande','Lucida Sans Unicode',sans-serif;background: black;border: 1px solid #4d4d4d;color: #b3b3b3;margin-top:8px;margin-left:8px;}";
//
// Left-side column;
normalRules += "#broadcaster_details {color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"; background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+"}";
// Links on left-side column (chat, crowd, stage)
normalRules += "#broadcaster_details .user_links>li>a.active {background-color: #111920;}";
// Links on left-side column active and hover;
normalRules += "#broadcaster_details .user_links>li>a.active:hover {background-color: #18242E;}";
// Links on left-side column hover;
normalRules += "#broadcaster_details .user_links>li>a:hover {background-color:#18242E}";
// Share button on left-side column has a special rule;
normalRules += "#broadcaster_details>#user_details>time>a.share {background:"+JSON.parse(localStorage.getItem('jefflr')).colorBackground+"}";
// jefflr: If element is active;
normalRules += ".toolkit_active {color:"+opts.colorActive+"}";
// jefflr: If element is active: hover;
normalRules += ".toolkit_active:hover {}";
// jefflr: If element is inactive;
normalRules += ".toolkit_inactive {color:"+opts.colorInactive+"}";
// jefflr: If element is inactive: hover;
normalRules += ".toolkit_inactive:hover {}";
//
// Last broadcast box (two-part box above comment post box);
normalRules += "#broadcast_chat>.comment_holder>#last_broadcaster {-webkit-box-shadow: none;box-shadow: none;border-right:1px solid #AAA;color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"; background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+"; background-color:none}";
// Broadcaster info (bottom two-thirds of last broadcast box);
normalRules += "#broadcast_chat>.comment_holder>#last_broadcaster>.broadcaster_info {-webkit-box-shadow: none;box-shadow: none;border-right:1px solid #AAA;color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"; background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+"; background-color:none}";
// Broadcaster info hover;
normalRules += "#broadcast_chat>.comment_holder>#last_broadcaster>.broadcaster_info:hover {background-color: #1F2B35}";
//
// For narrower screen res, remove left side;
// normalRules += "#broadcast_view {margin-left:none;}";
normalRules += "@media all and (max-width:55em){#broadcast_view {margin-left:0;} #broadcast_chat>.comment_holder {left:0%;margin:0 0 70px 0px;}}";
//
// Stupid onload FB share header;
normalRules += "#broadcast_chat>.comment_holder header {color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"; background-color: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+";}";
// Stupid onload FB share body;
normalRules += "#broadcast_chat>.comment_holder #facebook_one_click_share {color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"; background-color: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+";-webkit-box-shadow: none;box-shadow: none;}";
// Stupid onload FB share body hover;
normalRules += "#broadcast_chat>.comment_holder #facebook_one_click_share:hover {background-color: #1F2B35}";
// Hides the nasty FB icon on the onload FB share;
normalRules += "#broadcast_chat>.comment_holder #facebook_one_click_share>img.facebook {display:none;}";
//
// Comment post box (middle of comment box);
normalRules += "#broadcast_chat>.comment_holder>#chat_box {-webkit-box-shadow: none;box-shadow: none;border-right:1px solid #AAA;color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"; background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+"; background-color:none}";
// Comment post box input field (so it's not stark white);
normalRules += "#chat_box input {background:#333}";
// Background of heart in comment post box when it's disabled;
normalRules += "#chat_box .action.disabled {background-color:"+JSON.parse(localStorage.getItem('jefflr')).colorBackground+"}";
//
// Superfluous "All Comments" box between comment post box and comment list;
normalRules += "#broadcast_chat>.comment_holder header {background:none}";
//
// Comment box holder
normalRules += "#broadcast_chat>.comment_holder {-webkit-box-shadow: none;box-shadow: none;border-right:1px solid #AAA}";
// Comment list each comment font & background color;
normalRules += "#broadcast_chat>.comment_holder>#comments #comment_list>li {color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"; background-color: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+"}";
// Comment list each comment hover background color;
normalRules += "#broadcast_chat>.comment_holder>#comments #comment_list>li:hover {background-color: #1F2B35}";
// Comment list font size & color;
normalRules += "#broadcast_chat>.comment_holder p {color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+";font-size:1.1em;}";
// Usernames in the comment list;
normalRules += "#broadcast_chat>.comment_holder>#comments>header {-webkit-box-shadow: none;box-shadow: none;border-right:1px solid #AAA;color: "+opts.colorUsername+"; background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+"; background-color:none;border-top:1px solid #AAA}";
// Comments in comment list;
normalRules += "#broadcast_chat>.comment_holder>#chat_box textarea {color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"; background:"+JSON.parse(localStorage.getItem('jefflr')).colorBackground+";}";
//
// Notification box;
normalRules += "@media all {body.broadcast_chat .notification {-webkit-box-shadow: none;box-shadow: none;border-right:1px solid #AAA;color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"; background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+"; background-color:none; border:none; left:236px; top:47px;z-index:10009;}}";
// Here END the rules for the normal site;
//
// Here BEGIN the rules for the Beta site;
betaRules = "";
// Remove Share block;
betaRules += "@media all and (min-width:62.5em){#broadcast_main{width:100%;}}";
// Default behind-the-scenes (mostly);
betaRules += "#live_page_view {background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+";}";
// Search input itself;
betaRules += "#main_search {display:none;}";
// Special User block;
betaRules += "#blockUser {-webkit-transition: all 3s ease-in-out;-moz-transition: all 3s ease-in-out;-ms-transition: all 3s ease-in-out;-o-transition: all 3s ease-in-out;transition: all 3s ease-in-out;width: 100%;padding: 7px 12px 5px 12px;font-size: 11px;border-radius: 30px;-moz-border-radius: 30px;-webkit-border-radius: 30px;-ms-border-radius: 30px;-o-border-radius: 30px;behavior: url(/PIE.htc?l1351084804);height: 24px;font-family: 'Lucida$ Sans W01 Roman','Lucida Sans','Lucida Grande','Lucida Sans Unicode',sans-serif;background: black;border: 1px solid #4d4d4d;color: #b3b3b3;margin-top:8px;margin-left:8px;}";
//
// Change broadcaster name in center header;
betaRules += "@media only screen and (min-width:62.5em) {#broadcast_masthead .broadcaster_details .broadcaster_title h1{color: "+opts.colorUsername+";}}";
// Main block;
betaRules += "#broadcast_main {background: none;}";
// Main block (with media query);
betaRules += "@media only screen and (min-width:62.5em) {#broadcast_main {background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+";}}";
// Header block;
betaRules += ".hiddenStats #broadcast_masthead {color: "+opts.colorUsername+"; background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+";}";
// Header controls;
betaRules += ".broadcast_main_controls {background: #202020;}";
// Header controls (while broadcasting);
betaRules += "#broadcast_masthead {background: none;-webkit-box-shadow: none;-moz-box-shadow: none;box-shadow: none;}";
// Subheader controls (while broadcasting);
betaRules += ".stats_bar {background: none;}";
// Nav header;
betaRules += "header#main_header {background: #202020;}";
//
// Left-side block;
betaRules += "#broadcaster_artwork {background: none;}";
// Edit Profile button;
betaRules += "#follow_side_btn {background: none;}";
// Edit Profile button (already following);
betaRules += "#follow_side_btn.unfollow {background: none;}";
// Left-side block artwork thing;
betaRules += "#broadcaster_artwork .artwork_container {background-color: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+";}";
//
// Comment block
betaRules += "#comments_container {color: "+opts.colorUsername+"; background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+";}";
// Change annoying thin white bar above comment block;
betaRules += ".crowd_list {background:none;}";
// Comment block header;
betaRules += "#comments_block header {color: "+opts.colorUsername+"; background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+";border-bottom: 1px solid "+opts.colorUsername+";}";
// Comments inside the block;
betaRules += ".comment_list li {background: "+JSON.parse(localStorage.getItem('jefflr')).colorBackground+";border-bottom: 1px dotted "+opts.colorUsername+";}";
// Comments inside the block: hover;
betaRules += ".comment_list li:hover {background: #1F2B35;}";
// Inner box inside the comment block;
betaRules += ".comment_list li.editable_comment:hover .inner {background:none;}";
// Comment profile picture;
betaRules += ".comment_list .commenter_profile_img {border:1px solid "+opts.colorUsername+"}";
// Comment username;
betaRules += ".comment_list .comment_info h3 {color: "+opts.colorUsername+";text-transform: uppercase;}";
// Comment content;
betaRules += ".comment_list .comment_info p {color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+"; font-size:1.1em}";
// Comment history button;
betaRules += "#comment_history {background:none;}";
// Comment deletebutton;
betaRules += ".delete_options {background:#fff;}";
// Post bar inside comment block;
betaRules += "#chat_box {background:none;}";
// Heart action;
betaRules += "#chat_box .action {background: none; border: none;}";
// Heart action (disabled);
betaRules += "#chat_box .action.disabled {background: none; border: none;}";
// Input box inside post bar (large chat);
// betaRules += "#chat_box.large_chat form textarea {background:none;border: 1px solid "+opts.colorUsername+";}";
// Input box inside post bar (small chat);
betaRules += "#chat_box form textarea {color: "+JSON.parse(localStorage.getItem('jefflr')).colorComment+";background:none;border: 1px solid "+opts.colorUsername+";}";
betaRules += "@media screen {#chat_box form textarea {width:93%;}}";
// Submit button inside post bar;
betaRules += "#chat_box form input[type='submit'] {color: "+opts.colorUsername+";background:none;font-family: 'Avenir LT W01 85 Heavy','Helvetica Neue',Helvetica,arial,sans-serif;text-transform: uppercase;letter-spacing: 1px;text-align: center;}";
// Submit button inside post bar: hover;
betaRules += "#chat_box form input[type='submit']:hover {background:none;text-decoration:underline}";
// Post button (large chat);
betaRules += "#chat_box.large_chat form input[type='submit'] {width: 80px;height: 30px;margin-top: 20px;font-size:1.4em;}";
// Post button (small chat);
betaRules += "";
// Here END the rules for the Beta site;

// Creates the necessary element for injecting CSS;
var sheet = document.createElement('style');

// Remove default Mixlr buttons;
if (!document.getElementById("blockUser")) {
    $("#nav_first > li:nth-child(1)").remove();
    $("#nav_first > li:nth-child(1)").remove();
    $("#nav_second > li:nth-child(1)").remove();
    $("#nav_second > li:nth-child(1)").remove();
}

// Adds buttons;
// if (!document.getElementById("emo-toggle")) addEmo(); BROKEN RIGHT NOW
if (!document.getElementById("heart-toggle")) addHeart();
if (!document.getElementById("limit-toggle")) addLimit();
if (!document.getElementById("blockUser")) addUser();


// Beta site = betaRules, otherwise normal;
if (beta) {
    sheet.innerHTML = betaRules;
    var elComm = document.getElementById("comments_trigger");
    if (typeof elComm !== 'undefined' && typeof elComm !== null){
        elComm.click();
    }
    var elMast = document.getElementById("masthead_toggle");
    if (typeof elMast !== 'undefined' && typeof elMast !== null){
        elMast.click();
    }
    var elements = getElements('placeholder');
    for ( var i = 0; i < elements.length; i++ ) {
        elements[1].setAttribute("placeholder","Mixlr Toolkit by @therealtakeshi");
    }
} else {
    sheet.innerHTML = normalRules;
}
var el = document.getElementsByClassName("action");
if (typeof el !== 'undefined' && typeof el !== null){
    el[0].setAttribute("onClick","playSound(this,'http://www.bispoke.org/assets/gb/hornC4.wav');");
}
document.getElementsByTagName('head')[0].appendChild(sheet);

// select the target node
if (beta) {
    target = document.getElementsByClassName('comment_list')[0];
} else {
    target = document.getElementById('comment_list');
}

var arr = {
    user: ["Drew Pills","Blue Frills","True Gills"]
};

// select the target node
// var target = document.querySelector('#comment_list');

// create an observer instance
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        // console.log(mutation.addedNodes[0].outerHTML);
        var cid = $(mutation.addedNodes[0].outerHTML).attr("data-cid");
        var item = $("[data-cid="+cid+"]");
        // console.log(item.html());
        //
        // BROKEN RIGHT NOW;
        // if (opts.emo) {
        //     item.html().replace(/\:luchadeer/, '<img src="http://www.bispoke.org/assets/gb/2325664-mysterious_deer.png" title="luchadeer" />');
        //     item.html().replace(/\:jeff/, '<img src="http://www.bispoke.org/assets/gb/2322425-persona_jeff_t.png" title="jeff" />');
        // }
        //
        if (opts.msgLimit) msgLimit();
        for (i = 0; i < arr.user.length; i++) {
            if (item.html().indexOf("title=\""+arr.user[i]+"\"") >-1) item.remove();
        }
  });
});

// configuration of the observer:
var config = { attributes: true, childList: true, characterData: true };

// pass in the target node, as well as the observer options
observer.observe(target, config);