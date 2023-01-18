import {EventCalendar} from './calendar.js';

const initCalendar = () => {
  const calendarElement = document.querySelector('.event-cldr');
  if (!calendarElement) {
    return;
  }

  const options = {
    navArrowIconHTML: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.4773 9.16689L9.00732 4.69689L10.1857 3.51855L16.6673 10.0002L10.1857 16.4819L9.00732 15.3036L13.4773 10.8336H3.33398V9.16689H13.4773Z" fill="currentColor"/></svg>',
  };

  const calendar = new EventCalendar(calendarElement, options);
};

export {initCalendar};
