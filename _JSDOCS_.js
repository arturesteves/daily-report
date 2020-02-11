/**
 * @typedef {Object} Issue
 *
 * @property {string} id
 * @property {string} state
 * @property {string} description
 * @property {string} estimation
 */

/**
 * @typedef {Object} DailyReport
 *
 * @property {Date} date
 * @property {string} message
 */

/**
 * @typedef {Object} EmailConfig
 *
 * @property {string} user
 * @property {string} password
 * @property {string} host
 * @property {string} to - Comma separated values
 * @property {string} cc - Comma separated values
 * @property {string} subject
 * @property {string} [hostSMTP]
 * @property {string} [hostIMAP]
 */

/**
 * @typedef {"input" | "number" | "confirm" | "list" | "rawlist" | "expand" | "checkbox" | "password" | "editor" } Type
 */

/**
 * @typedef {Object} ChoiceObj
 *
 * @property {string} name
 * @property {string} value
 */

/**
 * @typedef {Object} Questions
 *
 * @property {Type} type
 * @property {string} name
 * @property {string | function} message
 * @property {string | number | boolean | array | function} [default]
 * @property {[string | number | ChoiceObj] | function} [choices]
 * @property {function} [validate]
 * @property {function | boolean} [when]
 */