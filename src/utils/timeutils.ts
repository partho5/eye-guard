// timeUtils.ts

// Function to format date and time in "DD Month HH:mm AM/PM" format
const formatDateTime = (date: Date): string => {
  // Check if the date is invalid
  try{
    if (isNaN(date.getTime())) {
      console.error("formatDateTime(): Invalid date. so return empty string.");
      return '';
    }
  }catch (e){}

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

  const dateString = `${day} ${month}`;
  const timeString = `${hours}:${minutesStr} ${ampm}`;

  /* if the date is today, no need to show the date. Show the time only */
  if(isToday(date)){
    return `${timeString}`;
  }

  return `${dateString} ${timeString}`;
};

// Function to calculate the future date and time in "DD Month HH:mm AM/PM" format
export const getAddedTimeHumanReadable = (currentTime: Date, minutesToAdd: number): string => {
  //const futureTime = new Date(currentTime.getTime() + minutesToAdd * 60000);
  //console.log("getAddedTimeHumanReadable()", currentTime);
  const futureTime = getAddedTime(currentTime, minutesToAdd);
  return formatDateTime(futureTime);
};

export const getAddedTime = (baseTime: Date, minutesToAdd: number) => {
  //console.log("getAddedTime()", baseTime);
  const futureTime = new Date(baseTime.getTime() + minutesToAdd * 60000);
  return futureTime;
}


const isToday = (date: Date): boolean => {
  // Check if the date is invalid
  if (isNaN(date.getTime())) {
    console.error('Invalid date');
    return false;
  }

  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};


export const isCurrentTimeAheadOf = (inputDate: Date): boolean => {
  const currentTime = new Date();
  return inputDate.getTime() < currentTime.getTime();
};

export const disablePeriodExpireTime = (appDisabledAt: Date, disableDurationInMinutes: number) => {
  return getAddedTime(appDisabledAt, disableDurationInMinutes);
}





/**
 * Checks if a given date-time object falls between a start and end time.
 *
 * @param dateTime - The date-time object to check.
 * @param startTime - The start time in 'hh:mm' 24-hour format.
 * @param endTime - The end time in 'hh:mm' 24-hour format.
 * @returns True if the dateTime is between startTime and endTime, false otherwise.
 */
export const isTimeBetween = (dateTime: Date, startTime: string, endTime: string): boolean => {
  const getTimeFromDate = (date: Date): number => {
    return date.getHours() * 60 + date.getMinutes();
  };

  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const currentTime = getTimeFromDate(dateTime);
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  // Handle the case where end time is past midnight
  if (start <= end) {
    return currentTime >= start && currentTime <= end;
  } else {
    return currentTime >= start || currentTime <= end;
  }
};
