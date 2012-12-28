/**
 * Based on Izzmo's AA, https://github.com/Izzmo/AutoAwesomer
 */

$(document).ready(function() {
  if(window.izzmo == undefined) window.izzmo = { };


  
  window.izzmo = $.extend(window.izzmo, {
    egg : {
      init: function() {
        alert('loading');
        $('ul#settings-dropdown').append($("<li class='option' id='eggtt'>EggTT</li>"));

      }
    },
    ttObj: null,
    awesomer: null,
    lamed: false,
    deg: 0.0,
    vote: function(c) {
      var f = $.sha1(window.izzmo.ttObj.roomId + c + window.izzmo.ttObj.currentSong._id);
      var d = $.sha1(Math.random() + "");
      var e = $.sha1(Math.random() + "");
      window.izzmo.socket({
          api: "room.vote",
          roomid: window.izzmo.ttObj.roomId,
          section: window.izzmo.ttObj.section,
          val: c,
          vh: f,
          th: d,
          ph: e
      });
    },
    socket: function (c, a) {
        if (c.api == "room.now") {
            return;
        }
        c.msgid = turntable.messageId;
        turntable.messageId += 1;
        c.clientid = turntable.clientId;
        if (turntable.user.id && !c.userid) {
            c.userid = turntable.user.id;
            c.userauth = turntable.user.auth;
        }
        var d = JSON.stringify(c);
        if (turntable.socketVerbose) {
            LOG(util.nowStr() + " Preparing message " + d);
        }
        var b = $.Deferred();
        turntable.whenSocketConnected(function () {
            if (turntable.socketVerbose) {
                LOG(util.nowStr() + " Sending message " + c.msgid + " to " + turntable.socket.host);
            }
            if (turntable.socket.transport.type == "websocket") {
                turntable.socketLog(turntable.socket.transport.sockets[0].id + ":<" + c.msgid);
            }
            turntable.socket.send(d);
            turntable.socketKeepAlive(true);
            turntable.pendingCalls.push({
                msgid: c.msgid,
                handler: a,
                deferred: b,
                time: util.now()
            });
        });
        return b.promise();
    },
    listener: function(d) {
      if(d.command == 'newsong' && d.room.metadata.current_dj != window.turntable.user.id) {
        clearTimeout(window.izzmo.awesomer);
        clearInterval(window.izzmo.arcInt);
        window.izzmo.lamed = false;
        var timeAmt = Math.floor(Math.random()*window.izzmo.ttObj.currentSong.metadata.length/4*1000);
        window.izzmo.botMessage.find('span').html('');
        window.izzmo.awesomer = setTimeout(function() {
          window.izzmo.vote('up');
        }, timeAmt);
      }
      else if(d.command == 'update_votes') {
        $.each(d.room.metadata.votelog, function() {
          if(this[0] == window.turntable.user.id) {
            window.izzmo.stop();
            return false;
          }
        });     
      }
    },
    room: '',
    watcher: null,
    stop: function() {
      clearTimeout(window.izzmo.awesomer);
      // clearInterval(window.izzmo.arcInt);
      // window.izzmo.arcInt = 0;
    },
    awesome: function() {
      window.izzmo.vote('up');
      window.izzmo.stop();
      // window.izzmo.setArc(180, false);
    },
    lame: function() {
      if(!window.izzmo.lamed) {
        window.izzmo.vote('up');
        window.izzmo.stop();
        window.izzmo.botMessage.find('span').html("Song lamed! Awesomering will resume next song.");
        window.izzmo.lamed = true;
      }
      // window.izzmo.setArc(180, true);
      setTimeout(function() {window.izzmo.vote('down');}, 250);
    },
    init: function() {
      window.izzmo.eggtt.init();
      console.log('Initializing AutoAwesomer.');
      $('.roomView').ready(function() {
        window.izzmo.ttObj = window.turntable.buddyList.room;
        if(window.izzmo.ttObj === null) {
          alert('Could not find turntable.fm objects. You should refresh your page and try again.');
          return;
        }
        window.izzmo.room = window.location.pathname;
        
        console.log('Configuring AutoAwesomer message bar...');
        window.izzmo.botMessage = $('<div id="bot-message">Izzmo\'s AutoAwesome. <span style="font-style: italic;"></span> <a href="#" style="text-decoration: none; color: red; font-weight: bold;">Turn off</a></div>');
        window.izzmo.botMessage.css({
          position: 'absolute',
          left: '3px',
          top: '44px',
          width: '100%',
          color: 'white',
          zIndex: '5000',
          textAlign: 'left',
          paddingLeft: '2px',
          paddingTop: '2px',
          paddingRight: '3px',
          paddingBottom: '2px',
          fontSize: '10px',
          fontFace: 'Verdana'
        });
        $('#header div.info').append(window.izzmo.botMessage);
        
        console.log('Setting up AutoAwesomer click events...');
        window.izzmo.botMessage.find('a').click(function(e) {
          e.preventDefault();
          window.izzmo.destruct();
          window.turntable.removeEventListener("message", window.izzmo.listener);
          window.izzmo = null;
        });

        // cancel TT's default callback for the lame button, add in our own.
        $('#lame-button').unbind().bind('click', function() {
          window.izzmo.lame();
        });

        turntable.addEventListener("message", window.izzmo.listener);
        window.izzmo.awesome(); // automatically awesome the song upon load

        // Timer for resetting Turntable's AFK Timers
        // Runs every 60 seconds
        console.log('Turning on AutoAwesomer anti-idle.');
        window.izzmo.botResetAFKTimer = setInterval(function() {
          $(window).focus();
        }, 60000);

        window.izzmo.watcher = setInterval(function() {
          if(window.location.pathname != window.izzmo.room) {
            console.log('New Room found, reinitializing...');
            window.izzmo.destruct();
          }
        }, 3000);
        console.log('AutoAwesomer setup complete.');
      });
    },
    destruct: function() {
      console.log('Turning off AutoAwesomer.');
      clearInterval(window.izzmo.botResetAFKTimer);
      clearInterval(window.izzmo.watcher);
      window.izzmo.stop();
      // window.izzmo.arc.remove();
      window.izzmo.botMessage.remove();
    }
  });
  
  window.izzmo.init();
});
