import { notifications } from "../stores/store";

export default class NotificationAPI {
  /**
   * a method to abstract out notification types
   * @param {String} type type of notification
   * @param {String} msg notification message
   * @private
   */
  static _notify(type, msg) {
    notifications.update(val => {
      return [...val, {
        type, msg, pk: Symbol()
      }];
    });
  }

  static delete(pk) {
    notifications.update(val => {
      return val.filter(v => {
        return (v.pk != pk);
      });
    });
  }

  
  static alert(msg) {
    NotificationAPI._notify("alert", msg);
  }

  static success(msg) {
    NotificationAPI._notify("success", msg);
  }

  static warning(msg) {
    NotificationAPI._notify("warning", msg);
  }
}