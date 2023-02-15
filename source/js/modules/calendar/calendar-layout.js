import {Calendar} from './calendar';

export class CalendarLayout {
  constructor({calendar, element, adjuster}) {
    this.initialized = false;
    this.calendar = calendar;
    this.element = element;
    this.adjuster = adjuster;
    this.dataLoaded = false;
    this.currentMonths = [];
    this._calendarLocale = calendar.options.locale;
    this.isChangeLocale = false;

    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSidebarMonthClick = this.onSidebarMonthClick.bind(this);
    this.onLoadEvents = this.onLoadEvents.bind(this);

    this.createCalendar();
    this.getEvents();
    this.addListener();
  }


  addListener() {
    this.element.addEventListener('mouseover', this.onMouseOver);
    this.element.addEventListener('mouseout', this.onMouseOut);
    this.element.addEventListener('click', this.onClick);
    this.element.addEventListener('loadDataSuccess', this.onLoadEvents);
  }

  addSidebar(isYearChange) {
    const activeSidebarElement = this.element.querySelector('.event-calendar__sidebar');

    if (activeSidebarElement && !isYearChange) {
      // изменение месяца без смены года
      const prevSelectedMonth = activeSidebarElement.querySelector('.event-calendar__month--selected');
      const newSelectedMonth = activeSidebarElement.querySelector(`[data-idx='${this.calendar.selected.month}']`);

      if (prevSelectedMonth !== newSelectedMonth) {
        prevSelectedMonth.classList.remove('event-calendar__month--selected');
        newSelectedMonth.classList.add('event-calendar__month--selected');
      }

      // Если менялись локализация
      if (this.isChangeLocale) {
        this.currentMonths.forEach((month, i) => {
          const monthElement = activeSidebarElement.querySelector(`[data-idx='${i}']`);
          month.label = this.calendar.monthsLocale[i];
          monthElement.textContent = month.label;
        });
        this.isChangeLocale = false;
      }

      return;
    } else if (activeSidebarElement && isYearChange) {
      // смена года
      this.currentMonths = [];
      this.calendar.monthsLocale.forEach((label, i) => {
        const monthElement = activeSidebarElement.querySelector(`[data-idx='${i}']`);
        const eventMonths = document.querySelectorAll('.event-calendar__month--event');
        eventMonths.forEach((el) => {
          el.removeAttribute('title');
          el.classList.remove('event-calendar__month--event');
        });

        this.currentMonths.push({
          date: new Date(this.calendar.selected.year, i),
          label,
          element: monthElement,
        });

        if (this.calendar.options.sidebar.shortMonthLabel) {
          monthElement.innerText = `${label.substring(0, 3)}`;
        } else {
          monthElement.innerText = `${label}`;
        }

        if (i === this.calendar.today.getMonth() && this.calendar.selected.year === this.calendar.today.year) {
          monthElement.classList.add('event-calendar__month--current');
        } else {
          monthElement.classList.remove('event-calendar__month--current');
        }
      });

      if (this.dataLoaded && this.calendar.options.sidebar.showEventsInfo) {
        this.addSidebarEvents();
      }

      return;
    }

    // Первичное создание сайдбара
    let sidebarElement = this._createElement({className: 'event-calendar__sidebar'});
    let monthListElement = this._createElement({tagName: 'ul', className: 'event-calendar__months'});

    this.calendar.monthsLocale.forEach((label, i) => {
      const monthElement = this._createElement({tagName: 'li', className: 'event-calendar__month'});
      monthElement.setAttribute('data-idx', i);
      monthElement.setAttribute('tabindex', '0');

      this.currentMonths.push({
        date: new Date(this.calendar.selected.year, i),
        label,
        element: monthElement,
      });

      if (this.calendar.options.sidebar.shortMonthLabel) {
        monthElement.innerText = `${label.substring(0, 3)}`;
      } else {
        monthElement.innerText = `${label}`;
      }

      if (i === this.calendar.today.getMonth() && this.calendar.selected.year === this.calendar.today.year) {
        monthElement.classList.add('event-calendar__month--current');
      }

      if (i === this.calendar.selected.month) {
        monthElement.classList.add('event-calendar__month--selected');
      }

      this._renderElement(monthListElement, monthElement);
    });

    sidebarElement.addEventListener('click', this.onSidebarMonthClick);

    this._renderElement(sidebarElement, monthListElement);

    if (this.calendar.options.sidebar.showNavigation && this.calendar.options.navigation) {
      this.addNavButtons(sidebarElement);
    }

    this._renderElement(this.bodySection, sidebarElement);
  }

  addNavigation() {
    const headerElement = this._createElement({className: 'event-calendar__header'});
    this.addNavButtons(headerElement);
    this._renderElement(this.mainSection, headerElement);
  }

  addHeader() {
    let headerElement = this.element.querySelector('.event-calendar__header');
    let monthLabelElement = this.element.querySelector('.event-calendar__month');
    let yearLabelElement = this.element.querySelector('.event-calendar__year');

    if (headerElement) {
      if (monthLabelElement && this.calendar.options.header.showMonth) {
        monthLabelElement.innerText = this.calendar.monthsLocale[this.calendar.selected.month];
      }

      if (yearLabelElement && this.calendar.options.header.showYear) {
        yearLabelElement.innerText = this.calendar.selected.year;
      }
      return;
    }

    headerElement = this._createElement({className: 'event-calendar__header'});
    const monthElement = this._createElement({className: 'event-calendar__current-month'});

    if (this.calendar.options.header.showMonth) {
      monthLabelElement = this._createElement({tagName: 'span', className: 'event-calendar__month'});

      monthLabelElement.innerText = this.calendar.monthsLocale[this.calendar.selected.month];
      this._renderElement(monthElement, monthLabelElement);
    }

    if (this.calendar.options.header.showYear) {
      yearLabelElement = this._createElement({tagName: 'span', className: 'event-calendar__year'});

      yearLabelElement.innerText = this.calendar.selected.year;
      this._renderElement(monthElement, yearLabelElement);
    }

    this._renderElement(headerElement, monthElement);

    if (this.calendar.options.header.showNavigation && this.calendar.options.navigation) {
      this.addNavButtons(headerElement);
    }

    if (this.calendar.options.header.secondPosition) {
      this._renderElement(this.mainSection, headerElement, 'afterbegin');
    } else {
      this._renderElement(this.parent, headerElement, 'afterbegin');
    }
  }

  addWeekdays() {
    const labelsListElement = this._createElement({tagName: 'ul', className: 'event-calendar__weekdays'});

    for (let label of this.calendar.weekLocale) {
      const labelItemElement = this._createElement({tagName: 'li', className: 'event-calendar__weekday'});

      labelItemElement.innerText = label;
      this._renderElement(labelsListElement, labelItemElement);
    }

    this._renderElement(this.mainSection, labelsListElement);
  }

  addDays() {
    this.daysListElement = this._createElement({tagName: 'ul', className: 'event-calendar__days'});
    let dayItemElement;
    let dayInnerLayout;

    const addWeekendClass = (count) => {
      for (let j = 0; j < this.calendar.weekends.length; j++) {
        if (count === this.calendar.weekends[j]) {
          dayItemElement.classList.add('event-calendar__day--weekend');
        }
      }
    };

    // Дни предыдущего месяца
    for (let i = 0; i < this.calendar.selected.firstDay; i++) {
      dayItemElement = this._createElement({tagName: 'li', className: ['event-calendar__day', 'event-calendar__day--prev']});

      // Выходные дни
      const weekendCount = i % 7;
      addWeekendClass(weekendCount);

      dayInnerLayout = this.createDayWrap((this.calendar.prev.days - this.calendar.selected.firstDay) + (i + 1));
      this._renderElement(dayItemElement, dayInnerLayout);
      this._renderElement(this.daysListElement, dayItemElement);
    }

    // Дни текущего месяца
    for (let i = 0; i < this.calendar.selected.days; i++) {
      dayItemElement = this._createElement({tagName: 'li', className: ['event-calendar__day', 'event-calendar__day--current']});

      // Выходные дни
      const weekendCount = (i + this.calendar.selected.firstDay) % 7;
      addWeekendClass(weekendCount);

      dayInnerLayout = this.createDayWrap(i + 1);
      this._renderElement(dayItemElement, dayInnerLayout);

      // Сегодняшний день
      if ((i + 1) === this.calendar.today.getDate() && this.calendar.selected.month === this.calendar.today.month && this.calendar.selected.year === this.calendar.today.year) {
        dayItemElement.classList.add('event-calendar__day--today');
      }

      this._renderElement(this.daysListElement, dayItemElement);
    }

    // Дни следующего месяца
    let extraDaysCount = 13;
    if (this.daysListElement.children.length > 35) {
      extraDaysCount = 6;
    } else if (this.daysListElement.children.length < 29) {
      extraDaysCount = 20;
    }

    for (let i = 0; i < extraDaysCount - this.calendar.selected.lastDay; i++) {
      dayItemElement = this._createElement({tagName: 'li', className: ['event-calendar__day', 'event-calendar__day--next']});

      // Выходные дни
      const weekendCount = (i + this.calendar.selected.lastDay + 1) % 7;
      addWeekendClass(weekendCount);

      dayInnerLayout = this.createDayWrap(i + 1);
      this._renderElement(dayItemElement, dayInnerLayout);
      this._renderElement(this.daysListElement, dayItemElement);
    }
    this._renderElement(this.mainSection, this.daysListElement);
  }

  addDayEvents() {
    // Добавляет события для текущего месяца
    let currentDays = document.querySelectorAll('.event-calendar__day.event-calendar__day--current');
    let events;

    for (let i = 0; i < this.calendar.selected.days; i++) {

      let day = currentDays[i];
      events = day.querySelector('.event-calendar__events');

      // Check Date against Event Dates
      for (let n = 0; n < this.calendar.model.length; n++) {
        let evDate = new Date(
            new Date(this.calendar.model[n].datetime).getFullYear(),
            new Date(this.calendar.model[n].datetime).getMonth(),
            new Date(this.calendar.model[n].datetime).getDate()
        );
        let toDate = new Date(this.calendar.selected.year, this.calendar.selected.month, i + 1);

        if (evDate.getTime() === toDate.getTime()) {
          let eventElement = this._createElement({tagName: 'span', className: 'event-calendar__event'});

          day.classList.add('event-calendar__day--event');
          day.setAttribute('tabindex', '0');

          if (this.calendar.model[n].url) {
            eventElement = this._createElement({tagName: 'a', className: 'event-calendar__event'});
            eventElement.setAttribute('href', this.calendar.model[n].url);
          }

          this._renderElement(eventElement, this.getEventTemplate(this.calendar.model[n]));

          this._renderElement(events, eventElement);
        }
      }
    }
  }

  getEventTemplate(jsonContent) {
    return this.calendar.options.eventItemTemplate(jsonContent);
  }

  addSidebarEvents() {
    // Добавляет информацию о событиях в боковом меню
    for (let i = 0; i < this.currentMonths.length; i++) {
      let monthObj = this.currentMonths[i];
      monthObj.eventsCount = 0;

      for (let n = 0; n < this.calendar.model.length; n++) {
        let evDate = new Date(
            new Date(this.calendar.model[n].datetime).getFullYear(),
            new Date(this.calendar.model[n].datetime).getMonth()
        );
        let toDate = new Date(this.currentMonths[i].date);

        if (evDate.getTime() === toDate.getTime()) {
          monthObj.eventsCount++;
          monthObj.element.title = `Количество событий в этом месяце: ${monthObj.eventsCount}`;
          monthObj.element.classList.add('event-calendar__month--event');
        }
      }
    }
  }

  addNavButtons(parent) {
    const prevElement = this._createElement({tagName: 'button', className: ['event-calendar__nav-btn', 'event-calendar__nav-btn--prev']});
    const nextElement = this._createElement({tagName: 'button', className: ['event-calendar__nav-btn', 'event-calendar__nav-btn--next']});

    prevElement.setAttribute('type', 'button');
    nextElement.setAttribute('type', 'button');

    if (this.calendar.options.navigation.prev.arialabel && this.calendar.options.navigation.next.arialabel) {
      prevElement.setAttribute('aria-label', this.calendar.options.navigation.prev.arialabel);
      nextElement.setAttribute('aria-label', this.calendar.options.navigation.next.arialabel);
    }

    if (this.calendar.options.navigation.prev.text && this.calendar.options.navigation.next.text) {
      const prevBtnTxtElement = this._createElement({tagName: 'span', className: 'event-calendar__nav-btn-text'});
      const nextBtnTxtElement = this._createElement({tagName: 'span', className: 'event-calendar__nav-btn-text'});

      prevBtnTxtElement.textContent = this.calendar.options.navigation.prev.text;
      nextBtnTxtElement.textContent = this.calendar.options.navigation.next.text;

      this._renderElement(prevElement, prevBtnTxtElement);
      this._renderElement(nextElement, nextBtnTxtElement);
    }

    if (this.calendar.options.navigation.prev.icon && this.calendar.options.navigation.next.icon) {
      prevElement.innerHTML += this.calendar.options.navigation.prev.icon;
      nextElement.innerHTML += this.calendar.options.navigation.next.icon;
    }

    this._renderElement(parent, prevElement, 'afterbegin');
    this._renderElement(parent, nextElement);
  }

  createDayWrap(dayLabel) {
    // Создание разметки внутри элемента дня
    const dayWrapElement = this._createElement({className: 'event-calendar__day-inner'});
    const numberElement = this._createElement({className: 'event-calendar__number'});
    const linksElement = this._createElement({className: 'event-calendar__events'});

    numberElement.innerText = dayLabel;

    this._renderElement(dayWrapElement, numberElement);
    this._renderElement(dayWrapElement, linksElement);

    return dayWrapElement;
  }

  createCalendar() {
    // Метод, который совершает первичную отрисовку
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.element.innerHTML = null;
    this.parent = this._createElement({className: 'event-calendar'});
    this.mainSection = this._createElement({className: 'event-calendar__main'});
    this.bodySection = this._createElement({className: 'event-calendar__body'});

    this._renderElement(this.element, this.parent);
    this._renderElement(this.parent, this.bodySection);
    this._renderElement(this.bodySection, this.mainSection);

    this.changeCalendar(this.calendar);
  }

  changeCalendar(calendar, adjuster) {
    // Метод, который совершает перерисовку календаря если передан adjuster.
    // Adjuster - принимает положительно или отрицательное число, регулирует в каком направлении
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
        // Добавляет контролы навигации когда шапке нет, а навигация должна быть
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
      this.addDayEvents();
    }
  }

  getEvents(url) {
    url = url ? url : this.element.dataset.eventsUrl;

    if (!url) {
      return;
    }

    fetch(url)
        .then((res) => {
          if (!res.ok) {
            this.dataLoaded = false;
            this.changeCalendar(this.calendar, 0);
            throw new Error(`Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          this.calendar.model = data.events;
          this.element.dispatchEvent(new CustomEvent('loadDataSuccess'));
          return data;
        });
  }

  onMouseOver(evt) {
    this.offsetEventsTooltip(evt);

    if (this.calendar.options.addActiveClassOnHoverEvent) {
      this.onEventDayHover(evt);
    }
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

  resetOffsetEventsTooltip(evt) {
    const eventDay = evt.target.closest('.event-calendar__day--event');

    if (!eventDay) {
      return;
    }

    const eventsElement = eventDay.querySelector('.event-calendar__events');

    eventsElement.style.width = null;
    eventsElement.style.left = null;
  }

  onEventDayHoverBlur(evt) {
    const eventDay = evt.target.closest('.event-calendar__day--event');

    if (!eventDay) {
      return;
    }

    eventDay.classList.remove('is-hover');
  }

  onClick(evt) {
    if (this.calendar.options.addActiveClassOnClickEvent) {
      this.onEventDayClick(evt);
    }
    this.onNavArrowsClick(evt);
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

  onLoadEvents() {
    this.dataLoaded = true;
    this.addDayEvents();

    if (this.calendar.options.sidebar) {
      // Добавляет логику отображения событий в сайдбаре
      this.addSidebarEvents();
    }

    // Обновляет состояние календаря при загрузке новых событий не меняя выбранный месяц
    this.changeCalendar(this.calendar, 0);
  }

  _nextMonth() {
    this.changeCalendar(this.calendar, 1);
  }

  _prevMonth() {
    this.changeCalendar(this.calendar, -1);
  }

  _nextYear() {
    this.changeCalendar(this.calendar, 12);
  }

  _prevYear() {
    this.changeCalendar(this.calendar, -12);
  }

  _goDate(month, year) {
    const currMonth = this.calendar.selected.month;
    const currYear = this.calendar.selected.year;

    month = typeof Number(month) === 'number' ? Number(month) : currMonth;
    year = typeof Number(year) === 'number' ? Number(year) : currYear;

    let adj = 0;

    if (month >= currMonth) {
      adj += month - currMonth - 1;
    } else {
      adj += (currMonth - month + 1) * -1;
    }

    if (year >= currYear) {
      adj += (year - currYear) * 12;
    } else {
      adj += (currYear - year) * -12;
    }

    if (isNaN(adj)) {
      return;
    }

    this.changeCalendar(this.calendar, adj);
  }

  _setLocale(code) {
    this._calendarLocale = code;
    this.isChangeLocale = true;
    this.changeCalendar(this.calendar);
  }

  _createElement(props) {
    const tag = props.tagName || 'div';
    const selector = props.className;
    const element = document.createElement(tag);

    if (selector) {
      if (Array.isArray(selector)) {
        element.classList.add(...selector);
      } else {
        element.classList.add(selector);
      }
    }

    return element;
  }

  _renderElement(container, component, place = 'beforeend') {
    switch (place) {
      case 'afterbegin':
        container.prepend(component);
        break;
      case 'afterend':
        container.after(component);
        break;
      case 'beforebegin':
        container.before(component);
        break;
      case 'beforeend':
        container.append(component);
        break;
    }
  }
}
