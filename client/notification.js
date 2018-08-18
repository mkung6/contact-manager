

angular.module('moment.resources')
    .factory('Notification', (railsResourceFactory) => {
      const resource = railsResourceFactory({
        url: `${CONFIG.RAILS_URL}/notifications`,
        name: 'notification',
      });

      resource.sendEmail = function (params) {
        return this.$get(`${this.$url()}/send_email`, params);
      };

      resource.showByCriteria = function (params) {
        return this.$get(`${this.$url()}/show_by_criteria`, params);
      };

      return resource;
    });
