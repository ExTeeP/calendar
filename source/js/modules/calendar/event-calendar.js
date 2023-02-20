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
    this.calendarLayout.changeCalendar(this.calendar, 1);
  }

  prevMonth() {
    this.calendarLayout.changeCalendar(this.calendar, -1);
  }

  nextYear() {
    this.calendarLayout.changeCalendar(this.calendar, 12);
  }

  prevYear() {
    this.calendarLayout.changeCalendar(this.calendar, -12);
  }

  goDate(month, year) {
    const currMonth = this.calendarLayout.calendar.selected.month;
    const currYear = this.calendarLayout.calendar.selected.year;

    month = typeof Number(month) === 'number' ? Number(month) : currMonth;
    year = typeof Number(year) === 'number' ? Number(year) : currYear;

    let adj = 0;

    if (month >= currMonth) {
      adj += month - currMonth - 1;
    } else {
      adj += (currMonth - month + 1) * -1;
    }

    if (year >= currYear) {
      adj += (year - currYear) * 12;
    } else {
      adj += (currYear - year) * -12;
    }

    if (isNaN(adj)) {
      return;
    }

    this.calendarLayout.changeCalendar(this.calendarLayout.calendar, adj);
  }

  getNewEvents(url) {
    this.calendarLayout.getEvents(url);
  }

  setLocale(code) {
    this.calendarLayout._calendarLocale = code;
    this.calendarLayout.isChangeLocale = true;
    this.calendarLayout.changeCalendar(this.calendarLayout.calendar);
  }
}
