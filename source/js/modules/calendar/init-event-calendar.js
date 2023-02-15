import {EventCalendar} from './event-calendar.js';

const initEventCalendar = () => {
  const calendarElement = document.querySelector('[data-event-calendar]');
  if (!calendarElement) {
    return;
  }

  // eslint-disable-next-line no-unused-vars
  const calendar = new EventCalendar(calendarElement);
  window.EventCalendar = calendar;
};

export {initEventCalendar};
