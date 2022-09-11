import luxforapi from "luxafor-api";
import ical from "node-ical";
import fetch from "node-fetch";
import { isWithinInterval, format, addMinutes, subMinutes } from "date-fns";
import { Notification } from "electron";

const ICS =
  "https://calendar.google.com/calendar/ical/alex%40procurify.com/public/basic.ics";

let _LUXAFOR_DEVICE;
const getLuxafor = () => {
  try {
    _LUXAFOR_DEVICE = luxforapi.device();
    return _LUXAFOR_DEVICE;
  } catch (e) {
    return _LUXAFOR_DEVICE;
  }
};

const isWithinEvent = (event: ical.CalendarComponent) => {
  return isWithinInterval(new Date(), {
    start: subMinutes(event.start as Date, 1),
    end: event.end as Date,
  });
};

const isEventWithinWarning = (event: ical.CalendarComponent) => {
  return isWithinInterval(new Date(), {
    start: subMinutes(event.start as Date, 1),
    end: addMinutes(event.start as Date, 1),
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const startupSequence = async () => {
  const luxafor = getLuxafor();

  return new Promise((resolve) => {
    luxafor.wave("cyan", luxforapi.constants.WAVE_SHORT);

    setTimeout(() => {
      luxafor.fadeTo("#000000");
      resolve(null);
    }, 3000);
  });
};

export const off = (): void => {
  const luxafor = getLuxafor();

  luxafor.off();
};

export const updateLED = (): void => {
  const luxafor = getLuxafor();

  fetch(ICS)
    .then(async (data) => {
      const ics = await data.text();

      ical.async.parseICS(ics).then((data) => {
        const currentEvent = Object.values(data).find((event) => {
          const recurrences = (event as any).recurrences;

          if (recurrences) {
            const currentRecur = Object.values(recurrences).find((e: any) => {
              return isWithinEvent(e) && e.type === "VEVENT";
            });

            if (currentRecur) return true;
          }

          return isWithinEvent(event) && event.type === "VEVENT";
        });

        if (!currentEvent) {
          off();
        } else if (isEventWithinWarning(currentEvent)) {
          luxafor.police(20);
        } else {
          luxafor.color("red");
        }
      });
    })
    .catch((err) => {
      new Notification({
        title: "ICS Error",
        body: JSON.stringify(err),
      }).show();
    });
};
