export const createDayEventTemplate = (props = {}) => {
  const href = props.url ? `href="${props.url}"` : false;
  const tag = href ? 'a' : 'span';
  const title = props.title ? `<span>${props.title}</span>` : '';
  const body = props.body ? props.body : '';

  return (`
    <${tag} class="event-calendar__event" ${href}>
      ${title}
      ${body}
    </${tag}>
  `);
};

const createDayItemTemplate = (props = {}) => {
  const isPrev = props.isPrev ? 'event-calendar__day--prev' : '';
  const isNext = props.isNext ? 'event-calendar__day--next' : '';
  const isCurrent = props.isCurrent ? 'event-calendar__day--current' : '';
  const isWeekend = props.isWeekend ? 'event-calendar__day--weekend' : '';
  const isToday = props.isToday ? 'event-calendar__day--today' : '';
  const dayNumber = props.date.getDate() || '';

  return (`
    <li class="event-calendar__day ${isPrev} ${isNext} ${isCurrent} ${isWeekend} ${isToday}">
      <div class="event-calendar__day-inner">
        <div class="event-calendar__number">
          ${dayNumber}
        </div>
        <div class="event-calendar__events"></div>
      </div>
    </li>
  `);
};

export const createDaysTemplate = (props = {}) => {
  const daysList = props.days;

  return (`
    <ul class="event-calendar__days">
      ${daysList.map((day) => createDayItemTemplate(day).trim()).join('')}
    </ul>
  `);
};
