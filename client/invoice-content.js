require('./invoice-content.scss');
const invoiceContentTemplate = require('./invoice-content.html');

angular.module('moment.components')
  .directive('invoiceContent', ($q, InvoiceService, Invoice, InvoiceLineItem, UserService, Notification, NotificationType, notificationResourceTypes, TimesheetEntry, Timesheet, $uibModal, $rootScope, toaster) =>
    ({
      restrict: 'E',
      template: invoiceContentTemplate,
      scope: {
        startDate: '=',
        endDate: '=',
        projectId: '=',
        invoice: '=?',
        accountsReceivable: '=?',
        uninvoiced: '=?',
        project: '=?',
        section: '=?',
      },
      controller($scope) {
        
        $scope.contactManager = (row) => {
          let notificationTypeId;
          NotificationType.showByCategory({ notificationCategory: 'OVERDUE_TIMESHEET_APPROVAL' }).then((notificationType) => {
            notificationTypeId = notificationType.id;

            const data = {
              userId: row.employee.managerId,
              resourceId: row.timesheet.id,
              resourceType: notificationResourceTypes.timesheet,
              notificationTypeId,
            };

            new Notification(data).create().then((notification) => {
              if (!notification.error) {
                Notification.sendEmail({ id: notification.id,
                  sender: UserService.currentUser.id,
                  override: true,
                });
                row.managerContacted = true;
                return true;
              }
              return $q.reject(notification.error);
            }).catch((error) => {
              if (!error.status) {
                // http errors are already handled
                toaster.pop({
                  type: 'error',
                  toasterId: 'toaster-right',
                  showCloseButton: true,
                  body: `An error has occurred while contacting project manager:
                  ${error}
                  Please try later again.`,
                });
              }
            });
          });
        };
      },
    }),
  );
