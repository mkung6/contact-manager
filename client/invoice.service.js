angular.module('moment.services')
  .service('InvoiceService', function (Invoice, DateUtil, TimesheetEntry, $rootScope, User,
                                       UserService, $q, Deliverable, toaster, Project, ProjectRole,
                                       InvoiceLineItem, TimesheetRow, Notification) {
    const self = this;

   function formatEntry(entry) {
      if (self.invoice.current) {
        entry.project = self.invoice.current.project;
        entry.modified = (entry.invoicingHours !== entry.hours);
      }
      return entry;
    }

   function getRowAmount(row) {
      /*
      multiple functions removed here
      */

   this.buildNotifications = (notifications) => {
      let managerId;
      let i;
      let temp;
      for (i = 0; i < notifications.length; i += 1) {
        temp = {
          timesheetId: notifications[i].resourceId,
          timeStamp: notifications[i].updatedAt,
        };
        managerId = notifications[i].userId;
        if (managerId in self.invoice.notifications) {
          self.invoice.notifications[managerId].push(temp);
        } else {
          self.invoice.notifications[managerId] = [temp];
        }
      }
      return self.invoice.notifications;
    };

   this.checkUpdated = (entry) => {
      let i;
      let managerIsContacted = false;
      const timesheetManager = _.find(self.invoice.users, user =>
        user.id === entry.timesheet.ownerId
      ).managerId;
      if (self.invoice.notifications[timesheetManager] !== undefined) {
        for (i = 0; i < self.invoice.notifications[timesheetManager].length; i += 1) {
          if (self.invoice.notifications[
            timesheetManager][i].timesheetId === entry.timesheet.id) {
            managerIsContacted = moment().diff(moment(
              self.invoice.notifications[timesheetManager][i].timeStamp, 'YYYY-MM-DD HH-mm-ss Z'))
              <= moment().diff(moment().subtract(12, 'hours'));
          }
        }
      }
      return managerIsContacted;
    };

   function groupEntriesByOwner(entries, deferred) {
      const rows = _.toArray(entries.reduce((res, entry) => {
        const managerIsContacted = self.checkUpdated(entry);
        const ownerEntry = res[entry.timesheet.ownerId];
        const invoicingHours = entry.invoicingHours ? entry.invoicingHours : 0;
        const hours = entry.hours ? entry.hours : 0;
        if (ownerEntry) {
          ownerEntry.hours += hours;
          ownerEntry.invoicingHours += invoicingHours;
          ownerEntry.nonBillableHours += entry.nonBillableHours;
          ownerEntry.entries.push(formatEntry(entry));
          ownerEntry.dismissed = false;
        } else {
          res[entry.timesheet.ownerId] = {
            employee: _.find(self.invoice.users, { id: entry.timesheet.ownerId }),
            hours,
            invoicingHours,
            nonBillableHours: entry.nonBillableHours,
            deliverable: _.find(self.invoice.deliverables, { id: entry.deliverableId }),
            projectRole: _.find(self.invoice.projectRoles, { id: entry.projectRoleId }),
            entries: [formatEntry(entry)],
            timesheet: entry.timesheet,
            isOverdue: checkOverdue(entry.timesheet),
            needsApproval: checkNeedsApproval(entry.timesheet),
            managerContacted: managerIsContacted,
            timesheetRow: _.find(self.invoice.timesheetRows, {
              projectRole: { id: entry.projectRoleId },
              timesheetId: entry.timesheet.id,
              owner: { id: entry.timesheet.ownerId } }),
          };
        }
        return res;
      }, {}));
      const temp = _.each(rows, (row) => {
        row.amount = getRowAmount(row);
        row.dismissed = rowIsDismissed(row);
        row.modified = rowIsModified(row);
      });
      deferred.resolve(temp);
    }

      TimesheetEntry.query(params).then((response) => {
        let i;
        if (!response.length) {
          deferred.resolve(response);
        } else {
          //unable to efficiently find this value programmatically without making calls to the server
          //had to hard code it in a const
          const overdueTimesheetApproval = 2;
          const timesheetId = [];
          for (i = 0; i < response.length; i += 1) {
            timesheetId[i] = response[i].timesheet.id;
          }
          //fetch our notifications
          Notification.showByCriteria({ 'notification_type_id[]': [overdueTimesheetApproval], 'resource_id[]': timesheetId }).then((notifications) => {
            self.buildNotifications(notifications);
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

          DateUtil.hydrateDates(response);
          // Get users and deliverables
          const ownerIds = _.uniq(_.map(response, ent => ent.timesheet.ownerId));
          const deliverableIds = _.uniq(_.map(response, ent => ent.deliverableId));
          $q.all(
            [getUsers(ownerIds),
              getDeliverables(deliverableIds),
              getProjectRoles(projectId)]
          ).then(() => {
            getTimesheetRows().then(() => {
              groupEntriesByOwner(response, deferred);
            });
          });
        }
      }, deferred.reject);

      return deferred.promise;
    };
  });
