System.register("ViewTeleporter", [], function($__export) {
  "use strict";
  var __moduleName = "ViewTeleporter";
  var state,
      Router;
  return {
    setters: [],
    execute: function() {
      state = {
        events: [],
        params: {},
        url: false,
        model: null
      };
      Router = (function() {
        function Router() {
          this.url = state.url;
          this.params = state.params;
          this.model = state.model;
          this.modelPath = state.modelPath;
          this.events = state.events;
        }
        return ($traceurRuntime.createClass)(Router, {
          onChange: function(cb) {
            this.events.push({invoke: cb});
          },
          back: function() {
            this.details(null);
          },
          invoke: function(model) {
            this.events.forEach((function(cb) {
              cb.invoke(model);
            }));
          },
          details: function(model) {
            if (model) {
              state.model = model;
              state.url = true;
              this.model = model;
              this.url = state.url;
              this.invoke(this.model);
            } else {
              state.url = false;
              this.url = state.url;
              this.invoke(null);
            }
          }
        }, {});
      }());
      $__export("Router", Router);
    }
  };
});

//# sourceMappingURL=ViewTeleporter.js.map