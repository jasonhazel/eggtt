/**
 * This used to be Izzmo's Auto Awesome (https://github.com/izzmo/AutoAwesomer)
 * I stripped almost everything out, and what remained was reworked.
 *
 * javascript:(function(){$('body').append('<script src=\'https://raw.github.com/mrhazel/eggtt/master/eggtt.js\'></script>');})();
 */


$(document).ready(function() {

  eggtt = { 
    init: function() {

      this.api.vote('up');

      this.autoqueue.init();

      //inject css
      // var head = $('head');
      // 
      // 
      
      $('head').append($("<link rel='stylesheet' href='https://raw.github.com/mrhazel/eggtt/master/eggtt.css' type='text/css'>"));

      turntable.addEventListener("message", this.autoqueue.listener);
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
    autoqueue : {
      active: false,
      listener: function(data) {
        console.debug(data);
      },
      init: function() {
        this.$autoqueue = eggtt.menu.add('autoqueue','menu-off','Auto Queue');
        this.$autoqueue.click(this.toggle);
      },
      toggle: function() {
        alert(1);
      }
    },
    api : {
      send: function(command, handler) {
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
        console.debug(turntable.buddyList.room);
        var f = $.sha1(turntable.buddyList.room.roomId + c + turntable.buddyList.room.currentSong._id);
        var d = $.sha1(Math.random() + "");
        var e = $.sha1(Math.random() + "");
        this.send({api: "room.vote", roomid: turntable.buddyList.room.roomId, section: turntable.buddyList.room.section, val: c, vh: f, th: d, ph: e });
      }, //end vote
      up: function() {
        this.vote('up');
      }, //end up
      down: function() {
        this.vote('down');
      } //end down
    }//end api
  }//end eggtt

  eggtt.init();
  // app = new eggtt
});
