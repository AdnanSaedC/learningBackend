import {createLogger, format, transports} from "winston";
const {combine, timestamp, json, colorize} = format;

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp }) => {
    return `${level}: ${message}`;
  })
);

// Create a Winston logger

//winstons is all about writing format for custom log and printing
//and morgan decides what to write 

//our logger will have these things
//1 level 2 changing into a format it must be of a color and should contain time and a structured object
//transport is all about where you want to display the data
//here is console and and in a file
//in console use this consoleLogFormat
const logger = createLogger({
  level: "info",
  format: combine(colorize(), timestamp(), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    new transports.File({ filename: "app.log" }),
  ],
});

export default logger;