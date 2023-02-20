export const createNavigationBtnTemplate = (props = {}, mod) => {
  const arialabel = props.arialabel ? `aria-label="${props.arialabel}"` : '';
  const text = props.text ? `<span class="event-calendar__nav-btn-text">${props.text}</span>` : '';
  const icon = props.icon ? `${props.icon}` : '';
  const btnMod = mod ? `event-calendar__nav-btn--${mod}` : '';

  return (`
    <button class="event-calendar__nav-btn ${btnMod}" type="button" ${arialabel}>
      ${icon}
      ${text}
    </button>
  `);
};

const createMonthYearTemplate = (props = {}) => {
  const month = props.month ? `<span class="event-calendar__month">${props.month}</span>` : '';
  const year = props.year ? `<span class="event-calendar__year">${props.year}</span>` : '';

  return (`
    <div class="event-calendar__current-month">
      ${month}
      ${year}
    </div>
  `);
};

export const createHeaderTemplate = (props = {}) => {
  const prevBtn = props.navigation.prev ? createNavigationBtnTemplate(props.navigation.prev, 'prev') : '';
  const nextBtn = props.navigation.next ? createNavigationBtnTemplate(props.navigation.next, 'next') : '';
  const monthYear = props.monthYear ? createMonthYearTemplate(props.monthYear) : '';

  return (`
    <div class="event-calendar__header">
      ${prevBtn}
      ${monthYear}
      ${nextBtn}
    </div>
  `);
};
