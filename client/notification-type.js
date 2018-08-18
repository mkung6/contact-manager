angular.module('moment.resources')
    .factory('NotificationType', (railsResourceFactory) => {
      const resource = railsResourceFactory({
        url: `${CONFIG.RAILS_URL}/notification_types`,
        name: 'notification_type',
      });

      resource.showByCategory = function (params) {
        return this.$get(`${this.$url()}/show_by_category`, params);
      };

      return resource;
    });
