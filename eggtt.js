/**
 * This used to be Izzmo's Auto Awesome (https://github.com/izzmo/AutoAwesomer)
 * I stripped almost everything out, and what remained was reworked.
 *
 * javascript:(function(){$('body').append('<script src=\'https://raw.github.com/mrhazel/eggtt/master/eggtt.js\'></script>');})();
 */


$(document).ready(function() {

  eggtt = { 
    init: function() {
      console.log('EggTT - Loaded.');
    },
    isMod: function() {
      return turntable.buddyList.room.isMod();
    },
    menu : {
      $main: null,
      init : function() {
        this.$main = $('ul#settings-dropdown');
      },
      add: function(id, klass, title) {
        if (this.$main === null) this.init();

        var $new_menu = $("<li>")
            .addClass('option' + (klass ? ' eggtt-'+klass : '')) // only because the extra space would drive me mad.
            .attr('id', 'eggtt-' + id)
            .html(title);

        $new_menu.prependTo(this.$main);
        return $new_menu;
      }
    },
    chattymissing: {
      chatty_id: '5022e5c6aaa5cd20d6000009',
      active: false,
      last_dj: null,
      init: function() {
          // only moderators can use it.
          if (!eggtt.isMod()) return;

          this.last_dj = turntable.buddyList.room.roomData.metadata.current_dj;

          if ($.inArray(eggtt.chattymissing.chatty_id, turntable.buddyList.room.listenerids) == -1) {
            turntable.addEventListener('message', eggtt.chattymissing.manual);
          }

          turntable.addEventListener('message', eggtt.chattymissing.check);
          console.log ('EggTT - Manual Queue Loaded.');
      },
      check: function(data) {
        switch (data.command) {
          case 'registered':
            if ($.inArray(eggtt.chattymissing.chatty_id, data.user) > -1) {
              eggtt.api.speak('/me [AUTOMATED] Chatty is back.  Time to queue up!');
              eggtt.api.speak('addme');
              turntable.removeEventListener(eggtt.chattymissing.manual);
            }
          break;
          case 'deregistered':
            if ($.inArray(eggtt.chattymissing.chatty_id, data.user) > -1) {
              eggtt.api.speak('/me [AUTOMATED] Chatty has gone missing.  Manual queue is on.');
              turntable.addEventListener(eggtt.chattymissing.manual);
            }
          break;
        }
      },
      manual: function(data) {
        switch (data.command) {
          case 'newsong':
            if (eggtt.chattymissing.last_dj) {
              eggtt.api.remDj(eggtt.chattymissing.last_dj);
            }

            eggtt.chattymissing.last_dj = data.room.metadata.current_dj;
          break;
          case 'speak':
            data.text = data.text.trim();
            if (data.text.match('addme')) {
              eggtt.api.speak("/me [AUTOMATED] Queue is currently manual.  FFA to get on deck. one song limit.");
            }
          break;

        }
      }


    },
    autoqueue : {
      active: false,
      bop_messages: ['dance','bounce','bop','groove','jump','boom','slam'],
      init: function() {
        // only moderators can use it.
        if (!eggtt.isMod()) return;
        
        this.$menu = eggtt.menu.add('autoqueue',null,'Auto Queue').css('color','green ');
        this.$menu.click(this.toggle);
        console.log ('EggTT - Autoqueue Loaded');
      },
      listener: function(data) {
        switch (data.command) {
          case 'rem_dj':
            if (data.user[0].userid == turntable.user.id) {
              setTimeout(function(){
                eggtt.api.speak('addme');
              }, 5000);
            }
          break;
          case 'newsong':
            if (data.room.metadata.current_dj === turntable.user.id) {
              var bop_message = Math.floor(Math.random()*eggtt.autoqueue.bop_messages.length);
              setTimeout(function(){
                eggtt.api.speak(eggtt.autoqueue.bop_messages[bop_message]);
              }, 5000);
            }
          break;
        }
      },
      toggle: function() {
        if(eggtt.autoqueue.active) {
          eggtt.autoqueue.active = false;
          eggtt.autoqueue.$menu.css('color','red');
          turntable.removeEventListener("message", eggtt.autoqueue.listener);
        }
        else {
          eggtt.autoqueue.active = true;
          eggtt.autoqueue.$menu.css('color','green');
          turntable.addEventListener("message", eggtt.autoqueue.listener);
          eggtt.api.speak('addme');
        }
      }
    },
    api : {
      send: function(command, handler) {
        // this is straight from Izzmo, with some more meaningful variable names.
        if (command.api == "room.now") return;

        command.msgid = turntable.messageId++;
        // turntable.messageId += 1;
        command.clientid = turntable.clientId;
        if (turntable.user.id && !command.userid) {
            command.userid = turntable.user.id;
            command.userauth = turntable.user.auth;
        }
        var json = JSON.stringify(command);
        if (turntable.socketVerbose) {
            LOG(util.nowStr() + " Preparing message " + json);
        }
        var deferred = $.Deferred();
        turntable.whenSocketConnected(function () {
            if (turntable.socketVerbose) {
                LOG(util.nowStr() + " Sending message " + command.msgid + " to " + turntable.socket.host);
            }
            if (turntable.socket.transport.type == "websocket") {
                turntable.socketLog(turntable.socket.transport.sockets[0].id + ":<" + command.msgid);
            }
            turntable.socket.send(json);
            turntable.socketKeepAlive(true);
            turntable.pendingCalls.push({
                msgid: command.msgid,
                handler: handler,
                deferred: deferred,
                time: util.now()
            });
        });
        return deferred.promise();
      }, //end send
      vote: function(c) {
        // also straight from Izzmo
        var f = $.sha1(turntable.buddyList.room.roomId + c + turntable.buddyList.room.currentSong._id);
        var d = $.sha1(Math.random() + ""); // i'm not a javascript expect, but this seems useless.
        var e = $.sha1(Math.random() + ""); // is it to turn the number into a string?
        this.send({api: "room.vote", roomid: turntable.buddyList.room.roomId, section: turntable.buddyList.room.section, val: c, vh: f, th: d, ph: e });
      }, //end vote
      speak : function(message) {
        this.send({ api: 'room.speak', roomid: turntable.buddyList.room.roomId, text: message.toString() });
      }, //end speak
      addDj : function() {
        this.send({ api: "room.add_dj", roomid: turntable.buddyList.room.roomId });
      }, // end add dj
      remDj: function(id) {
        this.send({api: "room.rem_dj", roomid: turntable.buddyList.room.roomId, djid: id });
      },
      up: function() {
        this.vote('up');
      }, //end up
      down: function() {
        this.vote('down');
      } //end down
    }//end api
  }//end eggtt

  eggtt.init();
  eggtt.autoqueue.init();
  eggtt.chattymissing.init();
});