export const getCalendarDataEvents = (url, instance) => {
  url = url ? url : instance.element.dataset.eventsUrl;

  if (!url) {
    return;
  }

  fetch(url)
      .then((res) => {
        if (!res.ok) {
          instance.dataLoaded = false;
          instance.changeCalendar(instance.calendar, 0);
          throw new Error(`Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        instance.calendar.model = data.events;
        instance.element.dispatchEvent(new CustomEvent('loadDataSuccess'));
      });
};
