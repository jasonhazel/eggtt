/**
 * This used to be Izzmo's Auto Awesome (https://github.com/izzmo/AutoAwesomer)
 * I stripped pretty much everything out.  I want it for the core bits.
 */

$(document).ready(function() {
  window.eggtt = {
    ttObj: null,
    init: function() {
      $('.roomView').ready(function() {
        window.eggtt.ttObj = window.turntable.buddyList.room;
        if(window.eggtt.ttObj === null) {
          alert('Could not find turntable.fm objects. You should refresh your page and try again.');
          return;
        }
        window.eggtt.menu.build();
        turntable.addEventListener("message", window.eggtt.listener);
      });
    },
    vote: function(c) {
      console.debug(window.eggtt.ttObj);
      var f = $.sha1(window.eggtt.ttObj.roomId + c + window.eggtt.ttObj.currentSong._id);
      var d = $.sha1(Math.random() + "");
      var e = $.sha1(Math.random() + "");
      this.socket({
          api: "room.vote",
          roomid: this.ttObj.roomId,
          section: this.ttObj.section,
          val: c,
          vh: f,
          th: d,
          ph: e
      });
    },
    socket: function (c, a) {
        if (c.api == "room.now") return;

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
    listener : function(d) {
      // console.debug(window.eggtt.ttObj);
      console.debug(window.turntable.user);
      // console.debug(d);
      if (d.command) {
        switch(d.command) {
          case 'newsong':
            setTimeout(window.eggtt.awesome(), 15000);
            break;
          case 'speak': 
            // it's your turn to DJ, hop up on deck
            displayName = window.turntable.user.displayName;
            match_to = "@" + displayName + "it's your turn to DJ";
            if (d.text.match(user))
              window.eggtt.socket({api: 'room.add_dj', roomid: window.eggtt.ttObj.roomId});
            break;
        }
      }
    },
    awesome:  function() { this.vote('up');     },
    lame:     function() { this.vote('down');   },
    destroy:  function() { this.menu.destroy();  },
    menu : {
      build: function() {
        this.$main = $("<li class='option' id='eggtt'>EggTT</li>");
        this.$main.prependTo($('ul#settings-dropdown'));
        
        this.$crowd = $("<li class='option eggtt-submenu id='eggtt-crowd'>Toggle Crowd</li>").hide();
        this.$main.after(this.$crowd);

        //-- register click events
        this.$main.click(this.main);
        this.$crowd.click(this.crowd);
      },
      main : function() {
        //-- REMEMBER: when in click events, use the full variable (window.eggtt.BLAH)
        // alert('I made a menu!');
        $('li.eggtt-submenu').slideToggle();
      },
      crowd : function() {
        var audience = $('div#audience').toggle();
      },
      about : function() {
        alert('THIS IS AN ALERT BOX!  WHY? BECAUSE I\'M AN ADULT AND I\'LL YELL IF I WANT TO!');
      },
      destroy : function() {
        this.$main.remove();
        this.$crowd.remove();
      }


    }
  }
  
  window.eggtt.init();
});
