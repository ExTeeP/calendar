/*
  За основу взят этот репозиторий
  https://github.com/jackducasse/caleandar

  дока
  https://www.notion.so/htmlacademy/30a5ef53a2db48048524a1004bec3c4e
*/

export class Calendar {
  constructor({model, options, date}) {
    // массив с данными для отображения
    this.model = model;
    // Значения по умолчанию
    this.options = Object.assign({
      // Отобразить шапку
      header: true,
      // Отобразить месяцы сбоку
      sidebar: true,
      // Отобразить навигацию
      navigation: true,
      // Локализация
      locale: 'RU',
      // Горизонтальный отступ от края области просмотра у тултипа
      tooltipOffsetFromEdge: 20,
      // Добавляет класс is-hover при наведении на день с событием(возможно будет нужно для доп. стилизации и тд.)
      addActiveClassOnHoverEvent: false,
      // Добавляет класс is-active при клике на день с событием(возможно будет нужно для доп. стилизации и тд.)
      addActiveClassOnClickEvent: false,
      eventItemTemplate: (jsonContent) => {
        const fragment = new DocumentFragment();
        const {title, body} = jsonContent;

        const titleElement = document.createElement('span');
        titleElement.textContent = title;

        const bodyElement = document.createTextNode(body);

        fragment.append(titleElement);
        fragment.append(bodyElement);
        return fragment;
      },
    }, options);

    if ((this.options.header && typeof this.options.header === 'object') || Boolean(this.options.header)) {
      this.options.header = Object.assign({
        // Если нужно отображать год
        showYear: true,
        // Если нужно отображать месяц
        showMonth: true,
        // показывать ли контролы навигации
        showNavigation: true,
        // второе расположение для шапки
        secondPosition: false,
      }, options.header);
    }

    if ((this.options.sidebar && typeof this.options.sidebar === 'object') || Boolean(this.options.sidebar)) {
      this.options.sidebar = Object.assign({
        // короткая запись месяца (первые 3 буквы)
        shortMonthLabel: false,
        // показывать ли контролы навигации
        showNavigation: false,
        // показывать ли информацию о событиях в месяце
        showEventsInfo: true,
      }, options.sidebar);
    }

    if ((this.options.navigation && typeof this.options.navigation === 'object') || Boolean(this.options.navigation)) {
      this.options.navigation = Object.assign({
        prev: {
          arialabel: 'Предыдущий месяц',
          text: '',
          icon: '<svg height="15" width="15" viewBox="0 0 100 75"><polyline points="0,0 100,0 50,75" fill="currentColor"></polyline></svg>',
        },
        next: {
          arialabel: 'Следующий месяц',
          text: '',
          icon: '<svg height="15" width="15" viewBox="0 0 100 75"><polyline points="0,0 100,0 50,75" fill="currentColor"></polyline></svg>',
        },
      }, options.navigation);
    }

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
    code = code.toUpperCase();
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
      case 'EN':
        this.selected.firstDay = new Date(this.selected.year, (this.selected.month), 1).getDay();
        this.selected.lastDay = new Date(this.selected.year, (this.selected.month + 1), 0).getDay();
        this.monthsLocale = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.weekLocale = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.weekends = [0, 6];
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
