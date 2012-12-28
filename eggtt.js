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
        // window.eggtt.room = window.location.pathname;
        window.eggtt.menu.build();

        turntable.addEventListener("message", this.listener);
      });
    },
    vote: function(c) {
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
    awesome:  function() { this.vote('up'); },
    lame:     function() { this.vote('down'); },
    destruct: function() {
      this.menu.destroy();
    },
    //-- menu specific code --//
    menu : {
      build: function() {
        this.$main = $("<li class='option' id='eggtt'>EggTT</li>");
        this.$main.prependTo($('ul#settings-dropdown'));
        
        //-- if we wanted to create a submenu.
        // this.$sub = $("<li class='option eggtt-submenu' id='submenu'>Sub Menu</li>");
        // this.$main.after(this.$sub);
        // this.$sub.hide();

        //-- register click events
        this.$main.click(this.main);

      },
      main : function() {
        //-- REMEMBER: when in click events, use the full variable (window.eggtt.BLAH)
        alert('I made a menu!');
      },
      destroy : function() {
        this.$main.remove();
      }


    }
  }
  
  window.eggtt.init();
});
