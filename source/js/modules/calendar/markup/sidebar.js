import {createNavigationBtnTemplate} from './header';

const createSidebarItemTemplate = (props = {}) => {
  const index = props.index;
  const label = props.label;
  const currentMod = props.isCurrent && 'event-calendar__month--current';
  const selectedMod = props.isSelected && 'event-calendar__month--selected';

  return (`
    <li class="event-calendar__month ${currentMod} ${selectedMod}" data-idx="${index}" tabindex="0">
      ${label}
    </li>
  `);
};

export const createSidebarListTemplate = (props = {}) => {
  const monthsList = props.items;

  return (`
    <ul class="event-calendar__months">
      ${monthsList.map((month) => createSidebarItemTemplate(month).trim()).join('')}
    </ul>
  `);
};

export const createSidebarTemplate = (props = {}) => {
  const prevBtn = props.navigation.prev ? createNavigationBtnTemplate(props.navigation.prev, 'prev') : '';
  const nextBtn = props.navigation.next ? createNavigationBtnTemplate(props.navigation.next, 'next') : '';
  const months = props.months ? `
    <div class="event-calendar__months-wrap">
      ${createSidebarListTemplate(props.months)}
    </div>` : '';

  return (`
    <div class="event-calendar__sidebar">
      ${prevBtn}
      ${months}
      ${nextBtn}
    </div>
  `);
};
