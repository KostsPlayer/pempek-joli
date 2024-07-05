import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const differenceTime = (
  timeParams,
  yearsParams = "y ",
  monthsParams = "mo ",
  daysParams = "d ",
  hoursParams = "h ",
  minutesParams = "m ",
  secondsParams = "s "
) => {
  const orderDate = dayjs(timeParams);
  const now = dayjs();

  const difference = orderDate.diff(now);

  const durationObj = dayjs.duration(difference);

  const years = durationObj.years() * -1;
  const months = durationObj.months() * -1;
  const days = durationObj.days() * -1;
  const hours = durationObj.hours() * -1;
  const minutes = durationObj.minutes() * -1;
  const seconds = durationObj.seconds() * -1;

  return `${
    years > 0
      ? years + yearsParams
      : months > 0
      ? months + monthsParams
      : days > 0
      ? days + daysParams
      : hours > 0
      ? hours + hoursParams
      : minutes > 0
      ? minutes + minutesParams
      : seconds > 0
      ? seconds + secondsParams
      : ""
  }`.trim();
};

export const durationTime = (
  timeParams,
  yearsParams = "y ",
  monthsParams = "mo ",
  daysParams = "d ",
  hoursParams = "h ",
  minutesParams = "m ",
  displaySecond = false,
  secondsParams = "s "
) => {
  const durationObj = dayjs.duration(
    Number ? timeParams : parseInt(timeParams, 10),
    "seconds"
  );

  const years = durationObj.years();
  const months = durationObj.months();
  const days = durationObj.days();
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();
  const seconds = durationObj.seconds();

  let result = "";
  if (years > 0) result += years + yearsParams;
  if (months > 0) result += months + monthsParams;
  if (days > 0) result += days + daysParams;
  if (hours > 0) result += hours + hoursParams;
  if (minutes > 0) result += minutes + minutesParams;
  if (displaySecond === true) {
    if (seconds > 0) result += seconds + secondsParams;
  }

  return result.trim();
};

export const calculateTime = (duration, paymentDate) => {
  const getDuration = Number ? duration : parseInt(timeParams, 10);
  const getPaymentDate = dayjs(paymentDate);
  const getDurationDate = getPaymentDate.add(getDuration, "seconds");

  return getDurationDate;
};

export const getOneWeekAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
};

export const getOneMonthAgo = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date;
};
