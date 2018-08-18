# contact-manager
My first Jira ticket as a full stack engineer involving a bug with the "Contact Manager" field.

Contains code that I worked on to solve this issue, with irrelevant code removed.

---
The Jira ticket description was as follows:

"Given, I contact the manager

Then, a green checkmark appears.

It persists for 12 hours"

---

I was able to find the Contact Manager in the `invoice-content.html` and saw that the flag was being controlled by an `ng-if` based on a `managerContacted` field. I noticed that the `managerContacted` was being evaluated in the `invoice.service.js` in a `TimesheetEntry.query` promise on line 141. I wrote my own promise, `Notification.showByCriteria` to find the relevant notifications. 

On the rails side, I used `show_by_criteria` to fetch the relevant notifications. I used special Ruby syntax `||= []` to return an array of the data the I need, but also doesn't break any dependencies from other methods that use this functionality and don't use an array. I was able to test this in `notifications_controller_spec.rb`, to make sure that it would return both an array and a regular non-array value.

Once I received these notifications on the client side, I simply evaluate it using `lodash` and `moment.js`. I had to format the JSON data on both the Rails and client side, as JSON has no standardized datetime format. After solving the issue, I refactored my code by making `buildNotifications`, `checkUpdated`, and `groupEntriesByOwner` their own methods. This helped simplify things when I wrote my tests in `invoice-service.spec.js`.

###### Please note this code will not run, it is just an example of work that I have performed.
