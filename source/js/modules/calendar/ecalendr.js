/*
  За основу взят этот репозиторий
  https://github.com/jackducasse/caleandar
*/

class Calendar {
  constructor({model, options, date}) {
    // массив с данными для отображения
    this.model = model;
    // Значения по умолчанию
    this.options = Object.assign({
      // Разметка для иконки
      navArrowIconHTML: '<svg height="15" width="15" viewBox="0 0 100 75"><polyline points="0,0 100,0 50,75" fill="currentColor"></polyline></svg>',
      // показывать ли контролы навигации
      showNavArrows: true,
      // показывать предыдущие и предстоящие месяцы сбоку
      navVertical: true,
      // отображать месяц в шапке с навигацией
      showHeader: true,
      // Локализация
      locale: 'RU',
      // Если нужно отображать год
      showHeaderYear: true,
      // Если нужно отображать месяц
      showHeaderMonth: true,
      // Горизонтальный отступ от края области просмотра у тултипа
      tooltipOffsetFromEdge: 20,
      // Добавляет класс is-hover при наведении на день с событием(возможно будет нужно для доп. стилизации и тд.)
      addActiveClassOnHoverEvent: true,
      // Добавляет класс is-active при клике на день с событием(возможно будет нужно для доп. стилизации и тд.)
      addActiveClassOnClickEvent: true,
    }, options);

    this.today = new Date();
    this.selected = date || this.today;
    this.today.month = this.today.getMonth();
    this.today.year = this.today.getFullYear();
    this.selected.month = this.selected.getMonth();
    this.selected.year = this.selected.getFullYear();
    this.selected.days = new Date(this.selected.year, this.selected.month + 1, 0).getDate();
    this.prev = new Date(this.selected.year, (this.selected.month - 1), 1);
    if (this.selected.month === 0) {
      this.prev = new Date(this.selected.year - 1, 11, 1);
    }
    this.prev.days = new Date(this.prev.getFullYear(), (this.prev.getMonth() + 1), 0).getDate();
    this.locale = this.options.locale;
  }

  get locale() {
    return this._locale;
  }

  set locale(code) {
    // Здесь можно указать настройки для локали (названия месяцев, дней недели и первый день недели)
    // todo добавить возможность ре-инициализации при смене локали?
    this._locale = code;
    switch (code) {
      case 'RU':
        // третьим аргументом передать 0 - если первый день недели Пн, 1 - если Вск
        this.selected.firstDay = new Date(this.selected.year, this.selected.month, 0).getDay();
        // третьим аргументом передать -1 - если первый день недели Пн, 0 - если Вск
        this.selected.lastDay = new Date(this.selected.year, this.selected.month + 1, -1).getDay();
        this.monthsLocale = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        this.weekLocale = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        this.weekends = [5, 6];
        break;
      default:
        this.selected.firstDay = new Date(this.selected.year, (this.selected.month), 1).getDay();
        this.selected.lastDay = new Date(this.selected.year, (this.selected.month + 1), 0).getDay();
        this.monthsLocale = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.weekLocale = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.weekends = [0, 6];
        break;
    }
  }
}

class CalendarLayout {
  constructor({calendar, element, adjuster}) {
    this.initialized = false;
    this.calendar = calendar;
    this.element = element;
    this.adjuster = adjuster;
    this.dataLoaded = false;

    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onLoadEvents = this.onLoadEvents.bind(this);
    this.init();
  }

  init() {
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

  addSidebar() {
    const activeSidebarElement = this.element.querySelector('.ecalendr__sidebar');

    if (activeSidebarElement) {
      activeSidebarElement.remove();
    }

    let sidebarElement = this._createElement({className: 'ecalendr__sidebar'});
    let monthListElement = this._createElement({tagName: 'ul', className: 'ecalendr__months'});

    for (let i = 0; i < this.calendar.monthsLocale.length - 1; i++) {
      const monthElement = this._createElement({tagName: 'li', className: 'ecalendr__month'});

      let n = i - (5 - this.calendar.selected.month);
      // Account for overflowing month values
      if (n < 0) {
        n += 12;
      } else if (n > 11) {
        n -= 12;
      }

      if (i < 5) {
        monthElement.classList.add('ecalendr__month--prev');
      } else if (i > 5) {
        monthElement.classList.add('ecalendr__month--next');
      } else {
        monthElement.classList.add('ecalendr__month--current');
      }

      let adj = (i - 5);
      monthElement.addEventListener('click', () => {
        this.changeCalendar(this.calendar, this.element, adj);
      });
      monthElement.innerHTML = this.calendar.monthsLocale[n].substring(0, 3);

      // Сегодняшний месяц
      // if (i === this.calendar.today.getMonth() && this.calendar.selected.month === this.calendar.today.month && this.calendar.selected.year === this.calendar.today.year) {
      //   monthElement.classList.add('ecalendr__month--today');
      // }

      this._renderElement(monthListElement, monthElement);
    }

    this._renderElement(sidebarElement, monthListElement);

    if (this.calendar.options.showNavArrows) {
      this.addNavButtons(sidebarElement);
    }

    this._renderElement(this.element, sidebarElement);
  }

  addHeader() {
    const headerElement = this._createElement({className: 'ecalendr__header'});
    const monthElement = this._createElement({className: 'ecalendr__current-month'});

    if (this.calendar.options.showHeaderMonth) {
      const monthLabelElement = this._createElement({tagName: 'span', className: 'ecalendr__month'});

      monthLabelElement.innerText = this.calendar.monthsLocale[this.calendar.selected.month];
      this._renderElement(monthElement, monthLabelElement);
    }

    if (this.calendar.options.showHeaderYear) {
      const yearLabelElement = this._createElement({tagName: 'span', className: 'ecalendr__year'});

      yearLabelElement.innerText = this.calendar.selected.year;
      this._renderElement(monthElement, yearLabelElement);
    }

    this._renderElement(headerElement, monthElement);

    if (this.calendar.options.showNavArrows && !this.calendar.options.navVertical) {
      this.addNavButtons(headerElement);
    }

    this._renderElement(this.mainSection, headerElement);
  }

  addWeekdays() {
    const labelsListElement = this._createElement({tagName: 'ul', className: 'ecalendr__weekdays'});

    for (let label of this.calendar.weekLocale) {
      const labelItemElement = this._createElement({tagName: 'li', className: 'ecalendr__weekday'});

      labelItemElement.innerText = label;
      this._renderElement(labelsListElement, labelItemElement);
    }

    this._renderElement(this.mainSection, labelsListElement);
  }

  addDays() {
    const daysListElement = this._createElement({tagName: 'ul', className: 'ecalendr__days'});
    let dayItemElement;
    let dayInnerLayout;

    const addWeekendClass = (count) => {
      for (let j = 0; j < this.calendar.weekends.length; j++) {
        if (count === this.calendar.weekends[j]) {
          dayItemElement.classList.add('ecalendr__day--weekend');
        }
      }
    };

    // Дни предыдущего месяца
    for (let i = 0; i < this.calendar.selected.firstDay; i++) {
      dayItemElement = this._createElement({tagName: 'li', className: ['ecalendr__day', 'ecalendr__day--prev']});

      // Выходные дни
      const weekendCount = i % 7;
      addWeekendClass(weekendCount);

      dayInnerLayout = this.createDayWrap((this.calendar.prev.days - this.calendar.selected.firstDay) + (i + 1));
      this._renderElement(dayItemElement, dayInnerLayout);
      this._renderElement(daysListElement, dayItemElement);
    }

    // Дни текущего месяца
    for (let i = 0; i < this.calendar.selected.days; i++) {
      dayItemElement = this._createElement({tagName: 'li', className: ['ecalendr__day', 'ecalendr__day--current']});

      // Выходные дни
      const weekendCount = (i + this.calendar.selected.firstDay) % 7;
      addWeekendClass(weekendCount);

      dayInnerLayout = this.createDayWrap(i + 1);
      this._renderElement(dayItemElement, dayInnerLayout);

      // Сегодняшний день
      if ((i + 1) === this.calendar.today.getDate() && this.calendar.selected.month === this.calendar.today.month && this.calendar.selected.year === this.calendar.today.year) {
        dayItemElement.classList.add('ecalendr__day--today');
      }

      this._renderElement(daysListElement, dayItemElement);
    }

    // Дни следующего месяца
    let extraDaysCount = 13;
    if (daysListElement.children.length > 35) {
      extraDaysCount = 6;
    } else if (daysListElement.children.length < 29) {
      extraDaysCount = 20;
    }

    for (let i = 0; i < extraDaysCount - this.calendar.selected.lastDay; i++) {
      dayItemElement = this._createElement({tagName: 'li', className: ['ecalendr__day', 'ecalendr__day--next']});

      // Выходные дни
      const weekendCount = (i + this.calendar.selected.lastDay + 1) % 7;
      addWeekendClass(weekendCount);

      dayInnerLayout = this.createDayWrap(i + 1);
      this._renderElement(dayItemElement, dayInnerLayout);
      this._renderElement(daysListElement, dayItemElement);
    }
    this._renderElement(this.mainSection, daysListElement);
  }

  addEvents() {
    // Добавляет события для текущего месяца
    let currentDays = document.querySelectorAll('.ecalendr__day.ecalendr__day--current');
    let events;

    for (let i = 0; i < this.calendar.selected.days; i++) {

      let day = currentDays[i];
      events = day.querySelector('.ecalendr__events');

      // Check Date against Event Dates
      for (let n = 0; n < this.calendar.model.length; n++) {
        let evDate = new Date(
            new Date(this.calendar.model[n].date).getFullYear(),
            new Date(this.calendar.model[n].date).getMonth(),
            new Date(this.calendar.model[n].date).getDate()
        );
        let toDate = new Date(this.calendar.selected.year, this.calendar.selected.month, i + 1);

        if (evDate.getTime() === toDate.getTime()) {
          let eventElement = this._createElement({tagName: 'span', className: 'ecalendr__event'});

          day.classList.add('ecalendr__day--event');

          if (this.calendar.model[n].link) {
            eventElement = this._createElement({tagName: 'a', className: 'ecalendr__event'});
            eventElement.setAttribute('href', this.calendar.model[n].link);
          }

          eventElement.innerHTML = this.calendar.model[n].content;

          this._renderElement(events, eventElement);
        }
      }
    }
  }

  addNavButtons(parent) {
    const prevElement = this._createElement({tagName: 'button', className: ['ecalendr__nav-btn', 'ecalendr__nav-btn--prev']});
    const nextElement = this._createElement({tagName: 'button', className: ['ecalendr__nav-btn', 'ecalendr__nav-btn--next']});

    prevElement.setAttribute('type', 'button');
    nextElement.setAttribute('type', 'button');

    prevElement.innerHTML = this.calendar.options.navArrowIconHTML;
    nextElement.innerHTML = this.calendar.options.navArrowIconHTML;

    this._renderElement(parent, prevElement, 'afterbegin');
    this._renderElement(parent, nextElement);
  }

  createDayWrap(dayLabel) {
    // Создание разметки внутри элемента дня
    const dayWrapElement = this._createElement({className: 'ecalendr__day-inner'});
    const numberElement = this._createElement({className: 'ecalendr__number'});
    const linksElement = this._createElement({className: 'ecalendr__events'});

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

    this.mainSection = this._createElement({className: 'ecalendr__main'});
    this._renderElement(this.element, this.mainSection);

    this.changeCalendar(this.calendar, this.element);
  }

  changeCalendar(calendar, element, adjuster) {
    // Метод, который совершает перерисовку календаря если передан adjuster.
    // Adjuster - принимает положительно или отрицательное число, регулирует в каком направлении
    // двигаться по тайм-лайну от текущего: -1 - прошлый месяц, 1 - следующий месяц.

    if (adjuster !== void 0) {
      let newDate = new Date(calendar.selected.year, calendar.selected.month + adjuster, 1);
      this.calendar = new Calendar({model: calendar.model, options: calendar.options, date: newDate});
      this.mainSection.innerHTML = '';
    }

    if (this.calendar.options.showHeader) {
      this.addHeader();
    }

    if (this.calendar.options.navVertical) {
      this.addSidebar();
    }

    this.addWeekdays();
    this.addDays();

    if (this.dataLoaded) {
      this.addEvents();
    }
  }

  getEvents() {
    fetch(this.element.dataset.eventsUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(res.status);
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
    const eventDay = evt.target.closest('.ecalendr__day--event');

    if (!eventDay) {
      return;
    }

    const eventsElement = eventDay.querySelector('.ecalendr__events');
    let wrapBoxCrd = eventsElement.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;

    if (wrapBoxCrd.width >= vw) {
      // смещение тултипа с событиями если он не помещается в окна просмотра
      eventsElement.style.width = `${vw - this.calendar.options.tooltipOffsetFromEdge * 2}px`;
      wrapBoxCrd = eventsElement.getBoundingClientRect();
      eventsElement.style.left = `${vw - (wrapBoxCrd.x + wrapBoxCrd.width) - this.calendar.options.tooltipOffsetFromEdge}px`;
    } else if (!(vw - (wrapBoxCrd.x + wrapBoxCrd.width) > 0)) {
      // смещение тултипа если он выходит за край окна просмотра
      eventsElement.style.left = `${vw - (wrapBoxCrd.x + wrapBoxCrd.width) - this.calendar.options.tooltipOffsetFromEdge}px`;
    }
  }

  onEventDayHover(evt) {
    const eventDay = evt.target.closest('.ecalendr__day--event');

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
    const eventDay = evt.target.closest('.ecalendr__day--event');

    if (!eventDay) {
      return;
    }

    const eventsElement = eventDay.querySelector('.ecalendr__events');

    eventsElement.style.width = null;
    eventsElement.style.left = null;
  }

  onEventDayHoverBlur(evt) {
    const eventDay = evt.target.closest('.ecalendr__day--event');

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

  onEventDayClick(evt) {
    const eventDay = evt.target.closest('.ecalendr__day--event');
    const activeDay = document.querySelector('.ecalendr__day--event.is-active');

    if (activeDay) {
      activeDay.classList.remove('is-active');
    }

    if (!eventDay) {
      return;
    }

    eventDay.classList.add('is-active');
  }

  onNavArrowsClick(evt) {
    const target = evt.target;

    if (!target.closest('.ecalendr__nav-btn')) {
      return;
    }

    const adjuster = target.closest('.ecalendr__nav-btn--prev') ? -1 : 1;

    this.changeCalendar(this.calendar, this.element, adjuster);
  }

  onLoadEvents() {
    this.dataLoaded = true;
    this.addEvents();
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

class ECalendr {
  constructor(element, settings = {}, data = []) {
    if (element && typeof element === 'string') {
      this.element = document.querySelector(element.trim());
    } else if (element && element.nodeType) {
      this.element = element;
    } else {
      throw new TypeError('Первый аргумент класса new ECalendr должен быть Node-узлом или строкой с корректным CSS-селектором.');
    }

    this.calendar = new Calendar({model: data, options: settings});
    // eslint-disable-next-line no-new
    new CalendarLayout({calendar: this.calendar, element: this.element});
  }
}

export {ECalendr};
