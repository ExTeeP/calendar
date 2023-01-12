/*
  За основу взят этот репозиторий
  https://github.com/jackducasse/caleandar
*/

class Calendar {
  constructor({model, options, date}) {
    // массив с данными для отображения
    this.model = model;
    // Значения по умолчанию
    this.options = {
      // Разметка для иконки
      navArrowIcon: '<svg height="15" width="15" viewBox="0 0 100 75"><polyline points="0,0 100,0 50,75" fill="currentColor"></polyline></svg>',
      // показывать ли контролы навигации
      showNavArrows: true,
      // показывать предыдущие и предстоящие месяцы сбоку
      navVertical: false,
      // где отображать вертикальную навигацию, если она не находится в положении по умолчанию, принимает строку-селектор
      navLocation: '',
      // отображать месяц в шапке с навигацией
      dateTimeShow: true,
      // где отображать месяц, если он не находится в положении по умолчанию, принимает строку-селектор
      datetimeLocation: '',
      // Дни недели должны быть слегка прозрачными. т.е.: [0,6] исчезать в воскресенье и субботу для EN и [5,6] для RU.
      disabledDays: [],
      // Локализация
      locale: 'RU',
      // Если нужно отображать год
      showYear: true,
      tooltipOffsetEdge: 20,
    };
    // склейка двух объектов опций
    this.options = Object.assign(this.options, options);

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
    this._locale = this.options.locale;

    this.init();
  }

  init() {
    this.locale = this._locale;
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
        break;
      case 'EN':
        this.selected.firstDay = new Date(this.selected.year, (this.selected.month), 1).getDay();
        this.selected.lastDay = new Date(this.selected.year, (this.selected.month + 1), 0).getDay();
        this.monthsLocale = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.weekLocale = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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

    this.eventsOnHover = this.eventsOnHover.bind(this);
    this.eventsOnHoverBlur = this.eventsOnHoverBlur.bind(this);
    this.onNavArrowsClick = this.onNavArrowsClick.bind(this);
    this.onLoadEvents = this.onLoadEvents.bind(this);
    this.init();
  }

  init() {
    this.createCalendar();
    this.getEvents();
    this.addListener();
  }

  addListener() {
    document.addEventListener('mouseover', this.eventsOnHover);
    document.addEventListener('mouseout', this.eventsOnHoverBlur);
    document.addEventListener('click', this.onNavArrowsClick);
    this.element.addEventListener('loadDataSuccess', this.onLoadEvents);
  }

  addSidebar() {
    let sidebarElement = this._createElement({className: 'cld-sidebar'});
    let monthListElement = this._createElement({tagName: 'ul', className: 'cld-monthList'});
    let prevElement;
    let nextElement;

    for (let i = 0; i < this.calendar.monthsLocale.length - 3; i++) {
      const monthElement = this._createElement({tagName: 'li', className: 'cld-month'});

      let n = i - (4 - this.calendar.selected.month);
      // Account for overflowing month values
      if (n < 0) {
        n += 12;
      } else if (n > 11) {
        n -= 12;
      }
      // Add Appropriate Class
      if (i === 0) {
        continue;
      } else {
        if (i < 4) {
          monthElement.classList.add('cld-pre');
        } else if (i > 4) {
          monthElement.classList.add('cld-post');
        } else {
          monthElement.classList.add('cld-curr');
        }

        let adj = (i - 4);
        monthElement.addEventListener('click', () => {
          this.changeCalendar(this.calendar, this.element, adj);
        });
        monthElement.innerHTML += this.calendar.monthsLocale[n].substring(0, 3);

        if (n === 0) {
          let yearElement = this._createElement({tagName: 'li', className: 'cld-year'});

          if (i < 5) {
            yearElement.innerHTML += this.calendar.selected.year;
          } else {
            yearElement.innerHTML += this.calendar.selected.year + 1;
          }

          this._renderElement(monthListElement, yearElement);
        }
      }

      this._renderElement(monthListElement, monthElement);
    }

    this._renderElement(sidebarElement, monthListElement);

    if (this.calendar.options.showNavArrows) {
      prevElement = this._createElement({className: ['cld-rwd', 'cld-nav']});
      nextElement = this._createElement({className: ['cld-fwd', 'cld-nav']});

      prevElement.innerHTML = this.calendar.options.navArrowIcon;
      nextElement.innerHTML = this.calendar.options.navArrowIcon;

      this._renderElement(sidebarElement, prevElement, 'afterbegin');
      this._renderElement(sidebarElement, nextElement);
    }

    if (this.calendar.options.navLocation) {
      const locationElement = document.querySelector(this.calendar.options.navLocation);

      locationElement.innerHTML = '';
      this._renderElement(locationElement, sidebarElement);
    } else {
      this._renderElement(this.element, sidebarElement);
    }
  }

  addDateTime() {
    let headerElement = this._createElement({className: 'cld-datetime'});
    let monthElement = this._createElement({className: 'today'});
    let prevElement;
    let nextElement;

    if (this.calendar.options.showYear) {
      monthElement.innerText = this.calendar.monthsLocale[this.calendar.selected.month] + ', ' + this.calendar.selected.year;
    } else {
      monthElement.innerText = this.calendar.monthsLocale[this.calendar.selected.month];
    }

    this._renderElement(headerElement, monthElement);

    if (this.calendar.options.showNavArrows && !this.calendar.options.navVertical) {
      prevElement = this._createElement({className: ['cld-rwd', 'cld-nav']});
      nextElement = this._createElement({className: ['cld-fwd', 'cld-nav']});

      prevElement.innerHTML = this.calendar.options.navArrowIcon;
      nextElement.innerHTML = this.calendar.options.navArrowIcon;

      this._renderElement(headerElement, prevElement, 'afterbegin');
      this._renderElement(headerElement, nextElement);
    }

    if (this.calendar.options.datetimeLocation) {
      const locationElement = document.querySelector(this.calendar.options.datetimeLocation);

      locationElement.innerHTML = '';
      this._renderElement(locationElement, headerElement);
    } else {
      this._renderElement(this.mainSection, headerElement);
    }
  }

  addLabels() {
    const labelsListElement = this._createElement({tagName: 'ul', className: 'cld-labels'});

    for (let label of this.calendar.weekLocale) {
      const labelItemElement = this._createElement({tagName: 'li', className: 'cld-label'});

      labelItemElement.innerText = label;
      this._renderElement(labelsListElement, labelItemElement);
    }

    this._renderElement(this.mainSection, labelsListElement);
  }

  addDays() {
    const daysListElement = this._createElement({tagName: 'ul', className: 'cld-days'});
    let dayItemElement;
    let dayInnerLayout;

    // Previous Month's Days
    for (let i = 0; i < this.calendar.selected.firstDay; i++) {
      dayItemElement = this._createElement({tagName: 'li', className: ['cld-day', 'prevMonth']});

      // Disabled Days
      let disabledDaysCount = i % 7;

      for (let j = 0; j < this.calendar.options.disabledDays.length; j++) {
        if (disabledDaysCount === this.calendar.options.disabledDays[j]) {
          dayItemElement.classList.add('disableDay');
        }
      }

      dayInnerLayout = this.createDayWrap((this.calendar.prev.days - this.calendar.selected.firstDay) + (i + 1));
      this._renderElement(dayItemElement, dayInnerLayout);
      this._renderElement(daysListElement, dayItemElement);
    }

    // Current Month's Days
    for (let i = 0; i < this.calendar.selected.days; i++) {
      dayItemElement = this._createElement({tagName: 'li', className: ['cld-day', 'currMonth']});

      // Disabled Days
      let disabledDaysCount = (i + this.calendar.selected.firstDay) % 7;

      for (let j = 0; j < this.calendar.options.disabledDays.length; j++) {
        if (disabledDaysCount === this.calendar.options.disabledDays[j]) {
          dayItemElement.classList.add('disableDay');
        }
      }

      dayInnerLayout = this.createDayWrap(i + 1);
      this._renderElement(dayItemElement, dayInnerLayout);

      // If Today..
      if ((i + 1) === this.calendar.today.getDate() && this.calendar.selected.month === this.calendar.today.month && this.calendar.selected.year === this.calendar.today.year) {
        dayItemElement.classList.add('today');
      }

      this._renderElement(daysListElement, dayItemElement);
    }

    // Next Month's Days
    // Always same amount of days in calendar
    let extraDaysCount = 13;
    if (daysListElement.children.length > 35) {
      extraDaysCount = 6;
    } else if (daysListElement.children.length < 29) {
      extraDaysCount = 20;
    }

    for (let i = 0; i < extraDaysCount - this.calendar.selected.lastDay; i++) {
      dayItemElement = this._createElement({tagName: 'li', className: ['cld-day', 'nextMonth']});

      // Disabled Days
      let disabledDaysCount = (i + this.calendar.selected.lastDay + 1) % 7;

      for (let j = 0; j < this.calendar.options.disabledDays.length; j++) {
        if (disabledDaysCount === this.calendar.options.disabledDays[j]) {
          dayItemElement.classList.add('disableDay');
        }
      }

      dayInnerLayout = this.createDayWrap(i + 1);
      this._renderElement(dayItemElement, dayInnerLayout);
      this._renderElement(daysListElement, dayItemElement);
    }
    this._renderElement(this.mainSection, daysListElement);
  }

  addEvents() {
    // Добавляет события для текущего месяца
    let currentDays = document.querySelectorAll('.cld-day.currMonth');
    let events;

    // Current Month's Days
    for (let i = 0; i < this.calendar.selected.days; i++) {

      let day = currentDays[i];
      events = day.querySelector('.cld-links');

      // Check Date against Event Dates
      for (let n = 0; n < this.calendar.model.length; n++) {
        let evDate = new Date(
            new Date(this.calendar.model[n].date).getFullYear(),
            new Date(this.calendar.model[n].date).getMonth(),
            new Date(this.calendar.model[n].date).getDate()
        );
        let toDate = new Date(this.calendar.selected.year, this.calendar.selected.month, i + 1);

        if (evDate.getTime() === toDate.getTime()) {
          const a = this._createElement({tagName: 'a'});
          const title = this._createElement({tagName: 'span', className: 'cld-title'});

          day.classList.add('eventday');
          a.setAttribute('href', this.calendar.model[n].link);
          a.innerHTML = this.calendar.model[n].title;

          this._renderElement(title, a);
          this._renderElement(events, title);
        }
      }
    }
  }

  createDayWrap(dayLabel) {
    // Создание разметки внутри элемента дня
    const dayWrapElement = this._createElement({className: 'cld-day-inner'});
    const numberElement = this._createElement({className: 'cld-number'});
    const linksElement = this._createElement({className: 'cld-links'});

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

    this.mainSection = this._createElement({className: 'cld-main'});
    this._renderElement(this.element, this.mainSection);

    if (this.calendar.options.navVertical) {
      this.addSidebar();
    }

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

    if (this.calendar.options.dateTimeShow) {
      this.addDateTime();
    }

    this.addLabels();
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

  eventsOnHover(evt) {
    const element = evt.target.closest('.eventday');

    if (!element) {
      return;
    }

    const linksWrap = element.querySelector('.cld-links');
    let wrapBoxCrd = linksWrap.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;

    if (wrapBoxCrd.width >= vw) {
      // смещение тултипа с событиями если он не помещается в окна просмотра
      linksWrap.style.width = `${vw - this.calendar.options.tooltipOffsetEdge * 2}px`;
      wrapBoxCrd = linksWrap.getBoundingClientRect();
      linksWrap.style.left = `${vw - (wrapBoxCrd.x + wrapBoxCrd.width) - this.calendar.options.tooltipOffsetEdge}px`;
    } else if (!(vw - (wrapBoxCrd.x + wrapBoxCrd.width) > 0)) {
      // смещение тултипа если он выходит за край окна просмотра
      linksWrap.style.left = `${vw - (wrapBoxCrd.x + wrapBoxCrd.width) - this.calendar.options.tooltipOffsetEdge}px`;
    }

    element.classList.add('is-active');
  }

  eventsOnHoverBlur(evt) {
    const element = evt.target.closest('.eventday');

    if (!element) {
      return;
    }

    const linksWrap = element.querySelector('.cld-links');

    element.classList.remove('is-active');
    linksWrap.style.width = null;
    linksWrap.style.left = null;
  }

  onNavArrowsClick(evt) {
    const target = evt.target;

    if (!target.closest('.cld-nav')) {
      return;
    }

    let adjuster = 1;

    if (target.closest('.cld-rwd')) {
      adjuster = -1;
    }

    this.changeCalendar(this.calendar, this.element, adjuster);
  }

  onLoadEvents() {
    this.dataLoaded = true;
    this.addEvents();
  }

  _createElement(props) {
    const selector = props.className;
    const element = document.createElement(props.tagName || 'div');

    if (Array.isArray(selector)) {
      element.classList.add(...selector);
    } else {
      element.classList.add(selector);
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

class EventCalendar {
  constructor(element, settings = {}, data = []) {
    this.element = element;
    this.data = data;
    this.settings = settings;

    this.init();
  }

  init() {
    if (!this.element) {
      return;
    }

    const obj = new Calendar({model: this.data, options: this.settings});
    // eslint-disable-next-line no-new
    new CalendarLayout({calendar: obj, element: this.element});
  }
}

export {EventCalendar};
