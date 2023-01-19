import {ECalendr} from './ecalendr.js';

const initEventCalendar = () => {
  const calendarElement = document.querySelector('.ecalendr');
  if (!calendarElement) {
    return;
  }

  const calendar = new ECalendr(calendarElement);
};

export {initEventCalendar};
