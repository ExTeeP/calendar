import {ECalendr} from './ecalendr.js';

const initEventCalendar = () => {
  const calendarElement = document.querySelector('[data-ecalendr]');
  if (!calendarElement) {
    return;
  }

  // eslint-disable-next-line no-unused-vars
  const calendar = new ECalendr(calendarElement);
  window.ECalendr = calendar;
};

export {initEventCalendar};
