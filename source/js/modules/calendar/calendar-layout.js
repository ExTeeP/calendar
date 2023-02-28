import {Calendar} from './calendar';
import {createElement, renderElement} from '../../utils/render';
import {createCalendarTemplate} from './markup/main';
import {createHeaderTemplate} from './markup/header';
import {createWeekdaysTemplate} from './markup/weekdays';
import {createDayEventTemplate, createDaysTemplate} from './markup/days';
import {createSidebarListTemplate, createSidebarTemplate} from './markup/sidebar';
import {getCalendarDataEvents} from './get-events';

export class CalendarLayout {
  constructor({calendar, element, adjuster}) {
    this.DAYS_COUNT = 42;

    this.initialized = false;
    this.calendar = calendar;
    this.element = element;
    this.adjuster = adjuster;
    this.dataLoaded = false;
    this._calendarLocale = calendar.options.locale;
    this.isChangeLocale = false;

    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSidebarMonthClick = this.onSidebarMonthClick.bind(this);
    this.onLoadEvents = this.onLoadEvents.bind(this);

    this.createCalendar();
  }

  addListener() {
    this.element.addEventListener('mouseover', this.onMouseOver);
    this.element.addEventListener('mouseout', this.onMouseOut);
    this.element.addEventListener('click', this.onClick);
    this.element.addEventListener('loadDataSuccess', this.onLoadEvents);
  }

  /* --== HEADER START ==-- */
  addNavigation() {
    const setup = {
      navigation: this.calendar.options.navigation,
    };

    const headerElement = createElement(createHeaderTemplate(setup));
    renderElement(this.mainSection, headerElement);
  }

  headerSoftChange() {
    let monthLabelElement = this.element.querySelector('.event-calendar__month');
    let yearLabelElement = this.element.querySelector('.event-calendar__year');

    if (monthLabelElement && this.calendar.options.header.showMonth) {
      monthLabelElement.innerText = this.calendar.monthsLocale[this.calendar.selected.month];
    }

    if (yearLabelElement && this.calendar.options.header.showYear) {
      yearLabelElement.innerText = this.calendar.selected.year;
    }
  }

  addHeader() {
    let container = this.mainSection;
    let headerElement = this.element.querySelector('.event-calendar__header');

    // Если хедер уже существует просто обновляется текстовый контент
    if (headerElement) {
      this.headerSoftChange();
      return;
    }

    const setup = {
      monthYear: {
        month: this.calendar.options.header.showMonth && this.calendar.monthsLocale[this.calendar.selected.month],
        year: this.calendar.options.header.showYear && this.calendar.selected.year,
      },
      navigation: this.calendar.options.header.showNavigation && this.calendar.options.navigation,
    };

    headerElement = createElement(createHeaderTemplate(setup));

    if (!this.calendar.options.header.secondPosition) {
      container = this.element.querySelector('.event-calendar');
    }

    renderElement(container, headerElement, 'afterbegin');
  }
  /* --== HEADER END ==-- */

  /* --== MAIN START ==-- */
  addWeekdays() {
    const weekdaysList = [];

    for (let label of this.calendar.weekLocale) {
      const weekdaySetup = {
        label,
      };

      weekdaysList.push(weekdaySetup);
    }

    const labelsListElement = createElement(createWeekdaysTemplate({list: weekdaysList}));
    renderElement(this.mainSection, labelsListElement);
  }

  addDays() {
    this.daysList = [];

    for (let index = 0; index < this.DAYS_COUNT; index++) {
      const daySetup = {
        isPrev: false,
        isNext: false,
        isCurrent: false,
        isWeekend: false,
        isToday: false,
        date: new Date(),
      };
      let dayNumber = 0;

      const isPrevDay = index < this.calendar.selected.firstDay;
      const isCurrentDay = !isPrevDay && index < (this.calendar.selected.firstDay + this.calendar.selected.days);

      // Дни предыдущего месяца
      if (isPrevDay) {
        daySetup.isPrev = true;
        dayNumber = (this.calendar.prev.days - this.calendar.selected.firstDay) + (index + 1);
        daySetup.date = new Date(this.calendar.selected.year, this.calendar.selected.month - 1, dayNumber);
      } else if (isCurrentDay) {
        daySetup.isCurrent = true;
        dayNumber = (index + 1) - this.calendar.selected.firstDay;
        daySetup.date = new Date(this.calendar.selected.year, this.calendar.selected.month, dayNumber);
      } else {
        daySetup.isNext = true;
        dayNumber = (index + 1) - (this.calendar.selected.firstDay + this.calendar.selected.days);
        daySetup.date = new Date(this.calendar.selected.year, this.calendar.selected.month + 1, dayNumber);
      }

      // Сегодняшний день
      if (daySetup.date.getTime() === this.calendar.today.getTime()) {
        daySetup.isToday = true;
      }

      if (
        index % 7 === this.calendar.weekends[0] ||
        index % 7 === this.calendar.weekends[1]
      ) {
        daySetup.isWeekend = true;
      }

      this.daysList.push(daySetup);
    }

    this.daysListElement = createElement(createDaysTemplate({days: this.daysList}));
    renderElement(this.mainSection, this.daysListElement);
  }
  /* --== MAIN END ==-- */

  /* --== SIDEBAR START ==-- */
  sidebarFillMonthsSetup() {
    this.currentMonths = [];

    this.calendar.monthsLocale.forEach((label, i) => {
      const monthSetup = {
        date: new Date(this.calendar.selected.year, i),
        label: this.calendar.options.sidebar.shortMonthLabel ? label.substring(0, 3) : label,
        index: i,
        isCurrent: false,
        isSelected: false,
      };

      if (i === this.calendar.today.getMonth() && this.calendar.selected.year === this.calendar.today.year) {
        monthSetup.isCurrent = true;
      }

      if (i === this.calendar.selected.month) {
        monthSetup.isSelected = true;
      }

      this.currentMonths.push(monthSetup);
    });
  }

  sidebarMonthListSoftChange(sidebarElement) {
    // смена месяца без смены года
    const prevSelectedMonth = sidebarElement.querySelector('.event-calendar__month--selected');
    const newSelectedMonth = sidebarElement.querySelector(`[data-idx='${this.calendar.selected.month}']`);

    if (prevSelectedMonth !== newSelectedMonth) {
      prevSelectedMonth.classList.remove('event-calendar__month--selected');
      newSelectedMonth.classList.add('event-calendar__month--selected');
    }

    // Если менялись локализация
    if (this.isChangeLocale) {
      this.currentMonths.forEach((month, i) => {
        const monthElement = sidebarElement.querySelector(`[data-idx='${i}']`);
        month.label = this.calendar.monthsLocale[i];
        monthElement.textContent = month.label;
      });
      this.isChangeLocale = false;
    }
  }

  sidebarMonthListHardChange(sidebarElement) {
    // если текущий год изменился, месяцы перерисовываются
    const monthsWrapElement = sidebarElement.querySelector('.event-calendar__months-wrap');

    monthsWrapElement.innerHTML = '';
    this.sidebarFillMonthsSetup();

    const monthsListElement = createElement(createSidebarListTemplate({items: this.currentMonths}));

    renderElement(monthsWrapElement, monthsListElement);
  }

  addSidebar(isYearChange) {
    const container = this.element.querySelector('.event-calendar__body');
    let sidebarElement = this.element.querySelector('.event-calendar__sidebar');

    if (sidebarElement) {
      if (isYearChange) {
        this.sidebarMonthListHardChange(sidebarElement);
      } else {
        this.sidebarMonthListSoftChange(sidebarElement);
      }
      return;
    }

    this.sidebarFillMonthsSetup();

    const setup = {
      navigation: this.calendar.options.sidebar.showNavigation && this.calendar.options.navigation,
      months: {
        items: this.currentMonths,
      },
    };

    sidebarElement = createElement(createSidebarTemplate(setup));

    sidebarElement.addEventListener('click', this.onSidebarMonthClick);
    renderElement(container, sidebarElement);
  }
  /* --== SIDEBAR END ==-- */

  /* --== METHODS START ==-- */
  getEvents(url) {
    getCalendarDataEvents(url, this);
  }

  offsetEventsTooltip(evt) {
    const eventDay = evt.target.closest('.event-calendar__day--event');

    if (!eventDay) {
      return;
    }

    const vw = document.documentElement.clientWidth;
    const eventsElement = eventDay.querySelector('.event-calendar__events');
    let wrapBoxCrd = eventsElement.getBoundingClientRect();

    if (wrapBoxCrd.width >= vw) {
      // смещение тултипа с событиями если он не помещается в окна просмотра
      eventsElement.style.width = `${vw - Number(this.calendar.options.tooltipOffsetFromEdge) * 2}px`;
      wrapBoxCrd = eventsElement.getBoundingClientRect();
      eventsElement.style.left = `${vw - (wrapBoxCrd.x + wrapBoxCrd.width) - Number(this.calendar.options.tooltipOffsetFromEdge)}px`;
    } else if (!(vw - (wrapBoxCrd.x + wrapBoxCrd.width) > 0)) {
      // смещение тултипа если он выходит за край окна просмотра
      eventsElement.style.left = `${vw - (wrapBoxCrd.x + wrapBoxCrd.width) - Number(this.calendar.options.tooltipOffsetFromEdge)}px`;
    }
  }

  resetOffsetEventsTooltip(evt) {
    const eventDay = evt.target.closest('.event-calendar__day--event');

    if (!eventDay) {
      return;
    }

    const eventsElement = eventDay.querySelector('.event-calendar__events');

    eventsElement.style.width = null;
    eventsElement.style.left = null;
  }

  changeCalendar(calendar, adjuster) {
    // Метод, который совершает перерисовку календаря.
    // adjuster - принимает положительно или отрицательное число, регулирует в каком направлении
    // двигаться по тайм-лайну от текущего: -1 - прошлый месяц, 1 - следующий месяц.

    if (adjuster !== void 0) {
      // перерысовывает календарь с новой датой
      const newOptions = Object.assign(calendar.options, {
        locale: this._calendarLocale,
      });
      let newDate = new Date(calendar.selected.year, calendar.selected.month + adjuster, 1);
      this.calendar = new Calendar({model: calendar.model, options: newOptions, date: newDate});
      this.daysListElement.remove();

      if ((calendar.selected.month + adjuster > 11 || calendar.selected.month + adjuster < 0) && this.calendar.options.sidebar) {
        this.addSidebar(true);
      }
    } else {
      // Срабатывает при первичной инициализации или при обновлении через this.changeCalendar(this.calendar);
      this.calendar.locale = this._calendarLocale;
      this.mainSection.innerHTML = null;

      this.addWeekdays();

      if (!this.calendar.options.header && this.calendar.options.navigation) {
        // Добавляет контролы навигации когда шапки нет, а навигация должна быть
        this.addNavigation();
      }
    }

    if (this.calendar.options.header) {
      this.addHeader();
    }

    if (this.calendar.options.sidebar) {
      this.addSidebar();
    }

    this.addDays();

    if (this.dataLoaded) {
      this.addJsonEvents();
    }
  }

  addJsonEvents() {
    let currentDays = document.querySelectorAll('.event-calendar__day');

    for (let i = 0; i < this.calendar.model.length; i++) {
      // Добавляет события к дням
      for (let n = 0; n < this.DAYS_COUNT; n++) {
        let evDate = new Date(
            new Date(this.calendar.model[i].datetime).getFullYear(),
            new Date(this.calendar.model[i].datetime).getMonth(),
            new Date(this.calendar.model[i].datetime).getDate()
        );
        let toDate = this.daysList[n].date;

        if (evDate.getTime() === toDate.getTime()) {
          const day = currentDays[n];
          const inner = day.querySelector('.event-calendar__events');

          day.classList.add('event-calendar__day--event');
          day.setAttribute('tabindex', '0');

          let eventElement = createElement(createDayEventTemplate(this.calendar.model[i]));
          renderElement(inner, eventElement);
        }
      }

      if (this.calendar.options.sidebar.showEventsInfo) {
        // Добавляет информацию о событиях в боковом меню
        for (let j = 0; j < this.currentMonths.length; j++) {
          let monthObj = this.currentMonths[j];
          monthObj.eventsCount = 0;

          for (let n = 0; n < this.calendar.model.length; n++) {
            let evDate = new Date(
                new Date(this.calendar.model[n].datetime).getFullYear(),
                new Date(this.calendar.model[n].datetime).getMonth()
            );
            let toDate = new Date(this.currentMonths[j].date);

            if (evDate.getTime() === toDate.getTime()) {
              monthObj.eventsCount++;
              const monthElement = this.element.querySelector(`[data-idx='${j}']`);
              monthElement.setAttribute('data-event-count', monthObj.eventsCount);
              monthElement.classList.add('event-calendar__month--event');
            }
          }
        }
      }
    }
  }

  createCalendar() {
    // Метод, который совершает первичную отрисовку
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.element.innerHTML = null;
    this.calendarElement = createElement(createCalendarTemplate());

    renderElement(this.element, this.calendarElement);
    this.mainSection = this.element.querySelector('.event-calendar__main');
    this.changeCalendar(this.calendar);
    this.getEvents();
    this.addListener();
  }
  /* --== METHODS END ==-- */

  /* --== LISTENERS START ==-- */
  onMouseOver(evt) {
    this.offsetEventsTooltip(evt);

    if (this.calendar.options.addActiveClassOnHoverEvent) {
      this.onEventDayHover(evt);
    }
  }

  onEventDayHover(evt) {
    const eventDay = evt.target.closest('.event-calendar__day--event');

    if (!eventDay) {
      return;
    }

    eventDay.classList.add('is-hover');
  }

  onMouseOut(evt) {
    if (this.calendar.options.addActiveClassOnHoverEvent) {
      this.onEventDayHoverBlur(evt);
    }
    this.resetOffsetEventsTooltip(evt);
  }

  onEventDayHoverBlur(evt) {
    const eventDay = evt.target.closest('.event-calendar__day--event');

    if (!eventDay) {
      return;
    }

    eventDay.classList.remove('is-hover');
  }

  onSidebarMonthClick(evt) {
    const monthItem = evt.target.closest('[data-idx]');

    if (!monthItem) {
      return;
    }

    let adj = null;

    if (Number(monthItem.dataset.idx) >= this.calendar.selected.month) {
      adj = monthItem.dataset.idx - this.calendar.selected.month;
    } else if (this.calendar.selected.month >= Number(monthItem.dataset.idx)) {
      adj = (this.calendar.selected.month - monthItem.dataset.idx) * -1;
    }

    const selectedMonth = evt.currentTarget.querySelector('.event-calendar__month--selected');

    if (selectedMonth) {
      selectedMonth.classList.remove('event-calendar__month--selected');
      monthItem.classList.add('event-calendar__month--selected');
    }

    this.changeCalendar(this.calendar, adj);
  }

  onEventDayClick(evt) {
    const eventDay = evt.target.closest('.event-calendar__day--event');
    const activeDay = document.querySelector('.event-calendar__day--event.is-active');

    const onMissClick = () => {
      if (eventDay) {
        return;
      }

      const activeItems = document.querySelectorAll('.event-calendar__day.is-active');

      activeItems.forEach((it) => {
        it.classList.remove('.is-active');
      });

      window.removeEventListener('click', onMissClick);
    };

    if (activeDay) {
      activeDay.classList.remove('is-active');
    }

    if (!eventDay) {
      return;
    }

    eventDay.classList.add('is-active');
    window.addEventListener('click', onMissClick);
  }

  onNavArrowsClick(evt) {
    const target = evt.target;

    if (!target.closest('.event-calendar__nav-btn')) {
      return;
    }

    const adjuster = target.closest('.event-calendar__nav-btn--prev') ? -1 : 1;

    this.changeCalendar(this.calendar, adjuster);
  }

  onClick(evt) {
    if (this.calendar.options.addActiveClassOnClickEvent) {
      this.onEventDayClick(evt);
    }
    this.onNavArrowsClick(evt);
  }

  onLoadEvents() {
    this.dataLoaded = true;
    this.addJsonEvents();

    // Обновляет состояние календаря при загрузке новых событий не меняя выбранный месяц
    this.changeCalendar(this.calendar, 0);
  }
  /* --== LISTENERS END ==-- */
}
