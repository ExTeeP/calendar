import {Calendar} from './calendar';
import {CalendarLayout} from './calendar-layout';
export class EventCalendar {
  constructor(element, settings = {}) {
    if (element && typeof element === 'string') {
      this.element = document.querySelector(element.trim());
    } else if (element && element.nodeType) {
      this.element = element;
    } else {
      throw new TypeError('Первый аргумент класса new EventCalendar должен быть Node-узлом или строкой с корректным CSS-селектором.');
    }

    this.calendarLayout = new CalendarLayout({
      calendar: new Calendar({model: [], options: settings, date: null}),
      element: this.element,
      adjuster: void 0,
    });
  }

  nextMonth() {
    this.calendarLayout._nextMonth();
  }

  prevMonth() {
    this.calendarLayout._prevMonth();
  }

  nextYear() {
    this.calendarLayout._nextYear();
  }

  prevYear() {
    this.calendarLayout._prevYear();
  }

  goDate(month, year) {
    this.calendarLayout._goDate(month, year);
  }

  getNewEvents(url) {
    this.calendarLayout.getEvents(url);
  }

  setLocale(code) {
    this.calendarLayout._setLocale(code);
  }
}
