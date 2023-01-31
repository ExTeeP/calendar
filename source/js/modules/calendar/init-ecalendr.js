import {ECalendr} from './ecalendr.js';

const initEventCalendar = () => {
  const calendarElement = document.querySelector('[data-ecalendr]');
  if (!calendarElement) {
    return;
  }

  const getEventItemTemplate = (obj) => {
    const fragment = new DocumentFragment();
    const {title, body} = obj;

    const titleElement = document.createElement('span');
    titleElement.textContent = title;

    const bodyElement = document.createTextNode(body);

    fragment.append(titleElement);
    fragment.append(bodyElement);
    return fragment;
  };

  const calendar = new ECalendr(calendarElement, {
    eventItemTemplate: getEventItemTemplate,
  });
  window.ECalendr = calendar;
};

export {initEventCalendar};
