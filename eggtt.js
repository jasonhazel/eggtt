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
      if (d.command) {
        switch(d.command) {
          case 'newsong':
            setTimeout(window.eggtt.awesome(), 15000);
            break;
        }
      }
    },
    add_dj  : function() { this.socket({api: 'room.add_dj', roomid: this.ttObj.roomId }); },
    awesome : function() { this.vote('up');     },
    lame    : function() { this.vote('down');   },
    destroy : function() { this.menu.destroy(); },
    menu : {
      autodj : {
        build : function() {
          this.$main = $("<li class='option' id='eggtt-autodj'>Auto DJ</li>");
          this.$main.prependTo($('ul#settings-dropdown'));

          this.$status = $("<li style='text-align:right;' class='option eggtt-autodj id='eggtt-autodj-status'>OFF</li>").hide();
          this.$main.data('status','OFF');
          this.$main.after(this.$status);
          
          this.$type = $("<li class='option eggtt-autodj id='eggtt-autodj-type'>One Shot</li>").hide();
          this.$main.data('type','one_shot');
          this.$status.after(this.$type);


          this.$delay = $("<li class='option eggtt-autodj id='eggtt-autodj-delay'>5 sec</li>").hide();
          this.$main.data('delay',5);
          this.$type.after(this.$delay);

          this.$main.click(function(){
            $('li.eggtt-autodj').slideToggle();
          });

          this.$status.click(function(){
            var main = window.eggtt.menu.autodj.$main;
            // alert(main.html());
            switch (main.data('status')) 
            {
              case 'OFF':
                  main.data('status','ON');
                break;
              case 'ON':
                  main.data('status','OFF');
                break;
            }            

            window.eggtt.menu.autodj.$status.html(main.data('status'));


          });
        } 
      },
      build: function() {
        // this.$main = $("<li class='option' id='eggtt'>EggTT</li>");
        // this.$main.prependTo($('ul#settings-dropdown'));
        
        // this.$crowd = $("<li class='option eggtt-submenu id='eggtt-crowd'>Toggle Crowd</li>").hide();
        // this.$main.after(this.$crowd);

        this.autodj.build();
        // //-- register click events
        // this.$main.click(this.main);
        // this.$crowd.click(this.crowd);
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
