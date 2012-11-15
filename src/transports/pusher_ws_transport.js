;(function() {

  function PusherWSTransport(key, options) {
    Pusher.EventsDispatcher.call(this);

    this.key = key;
    this.options = options;
  };
  var prototype = PusherWSTransport.prototype;

  Pusher.Util.extend(prototype, Pusher.EventsDispatcher.prototype);

  // interface

  prototype.name = "ws";

  prototype.connect = function() {
    var self = this;
    var url = getURL(this.options);

    this.socket = new WebSocket(url);
    this.socket.onopen = function() {
      changeState(self, "open");
      self.socket.onopen = undefined;
    };
    this.socket.onerror = function(error) {
      self.emit("error", { type: 'WebSocketError', error: error });
    }
    this.socket.onclose = function() {
      changeState(self, "closed");
    }
    this.socket.onmessage = function(message) {
      self.emit("message", message);
    }

    changeState(this, "connecting");
    Pusher.debug('Connecting', url);
  };

  prototype.close = function() {
    this.socket.close();
  };

  prototype.send = function(data) {
    if (this.state === "open") {
      // Workaround for MobileSafari bug (see https://gist.github.com/2052006)
      var self = this;
      setTimeout(function() {
        self.socket.send(data);
      }, 0);
      return true;
    } else {
      return false;
    }
  };

  prototype.supportsPing = function() {
    // We have no way to know whether we're using a browser that supports ping
    return false;
  }

  // helpers

  function getURL(options) {
    var port = options.secure ? options.securePort : options.nonsecurePort;
    var scheme = options.secure ? "wss" : "ws";

    return scheme + "://" + options.host + ':' + port + options.path;
  }

  function changeState(o, state, params) {
    o.state = state;
    o.emit(state, params);
  }

  this.PusherWSTransport = PusherWSTransport;
}).call(this);
