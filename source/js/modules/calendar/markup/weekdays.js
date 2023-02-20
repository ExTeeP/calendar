const createWeekdayTemplate = (props = {}) => {
  const label = props.label || '';

  return (`
    <li class="event-calendar__weekday">
      ${label}
    </li>
  `);
};

export const createWeekdaysTemplate = (props = {}) => {
  const daysList = props.list;

  return (`
    <ul class="event-calendar__weekdays">
      ${daysList.map((day) => createWeekdayTemplate(day).trim()).join('')}
    </ul>
  `);
};
