describe('set managerContacted', () => {
  let createService;
  let InvoiceService;
  let test;
  let time;
  let notification;
  let entry;

  beforeEach(window.module('moment.services'));

  beforeEach(inject(($injector) => {
    createService = () => $injector.get('InvoiceService');
    InvoiceService = createService();
  }));

  describe('it builds notifications', () => {
    beforeEach(() => {
      time = moment().format('YYYY-MM-DD HH-mm-ss Z');
      notification = [{
        userId: 1,
        resourceId: 1000,
        updatedAt: time,
      }];
    });

    it('and creates it for a single timesheet', () => {
      spyOn(InvoiceService, 'buildNotifications').and.callThrough();
      test = InvoiceService.buildNotifications(notification);
      expect(InvoiceService.buildNotifications).toHaveBeenCalled();
      expect(test).toEqual(jasmine.objectContaining({
        1: [{
          timesheetId: 1000,
          timeStamp: time,
        }],
      }));
    });

    it('and creates them for multiple timesheets with same manager', () => {
      notification.push({
        userId: 1,
        resourceId: 2000,
        updatedAt: time,
      });
      spyOn(InvoiceService, 'buildNotifications').and.callThrough();
      test = InvoiceService.buildNotifications(notification);
      expect(InvoiceService.buildNotifications).toHaveBeenCalled();
      expect(test).toEqual(jasmine.objectContaining({
        1: [{
          timesheetId: 1000,
          timeStamp: time,
        }, {
          timesheetId: 2000,
          timeStamp: time,
        }],
      }));
    });

    it('and creates them for multiple timesheets with different managers', () => {
      notification.push({
        userId: 2,
        resourceId: 3000,
        updatedAt: time,
      });
      spyOn(InvoiceService, 'buildNotifications').and.callThrough();
      test = InvoiceService.buildNotifications(notification);
      expect(test).toEqual(jasmine.objectContaining({
        1: [{
          timesheetId: 1000,
          timeStamp: time,
        }],
        2: [{
          timesheetId: 3000,
          timeStamp: time,
        }],
      }));
    });
  });

  describe('it checks the notification timestamp', () => {
    beforeEach(() => {
      InvoiceService.invoice.users = [{
        id: 2,
        managerId: 1,
      }];

      entry = {
        timesheet: {
          ownerId: 2,
          id: 1000,
        },
      };
    });

    it('sets managerContacted to true if notification is within 12 hours', () => {
      time = moment().format('YYYY-MM-DD HH-mm-ss Z');
      InvoiceService.invoice.notifications[1] = [{
        timesheetId: 1000,
        timeStamp: time,
      }];
      spyOn(InvoiceService, 'checkUpdated').and.callThrough();
      test = InvoiceService.checkUpdated(entry);
      expect(InvoiceService.checkUpdated).toHaveBeenCalled();
      expect(test).toEqual(true);
    });

    it('sets managerContacted to false if notification is over 12 hours', () => {
      time = moment().subtract(13, 'hours').format('YYYY-MM-DD HH-mm-ss Z');
      InvoiceService.invoice.notifications[1] = [{
        timesheetId: 1000,
        timeStamp: time,
      }];
      spyOn(InvoiceService, 'checkUpdated').and.callThrough();
      test = InvoiceService.checkUpdated(entry);
      expect(InvoiceService.checkUpdated).toHaveBeenCalled();
      expect(test).toEqual(false);
    });
  });
});
