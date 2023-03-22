const
  fs = require('fs'),
  handlebars = require('handlebars'),
  handlebarsWax = require('handlebars-wax'),
  addressFormat = require('address-format'),
  moment = require('moment'),
  Swag = require('swag');
require('./moment-precise-range.js');

const helpers = require('./app/utils/helpers');

Swag.registerHelpers(handlebars);

handlebars.registerHelper(helpers);
let otherHelpers = {
  removeProtocol: function (url) {
    return url.replace(/.*?:\/\//g, '');
  },

  concat: function () {
    let res = '';

    for (let arg in arguments) {
      if (typeof arguments[arg] !== 'object') {
        res += arguments[arg];
      }
    }

    return res;
  },

  formatAddress: function (address, city, region, postalCode, countryCode) {
    let addressList = addressFormat({
      address: address,
      city: city,
      subdivision: region,
      postalCode: postalCode,
      countryCode: countryCode
    });


    return addressList.join('<br/>');
  },

  formatDate: function (date) {
    return moment(date).format('MMMM YYYY');
  }
};
handlebars.registerHelper(otherHelpers);


function processResumeJson(resume) {
  for (let work_info of resume.work) {
    const start_date = moment(work_info.startDate, 'YYYY-MM-DD');
    const end_date = moment(work_info.endDate, 'YYYY-MM-DD');
    const can_calculate_period = start_date.isValid() && end_date.isValid();

    if (can_calculate_period) {
      work_info.duration = moment.preciseDiff(start_date, end_date)
    }

  }
}

function render(resume) {
  let dir = __dirname + '/public',
    css = fs.readFileSync(dir + '/styles/main.css', 'utf-8'),
    resumeTemplate = fs.readFileSync(dir + '/views/resume.hbs', 'utf-8');

  let Handlebars = handlebarsWax(handlebars);

  Handlebars.partials(dir + '/views/partials/**/*.{hbs,js}');
  Handlebars.partials(dir + '/views/components/**/*.{hbs,js}');
  processResumeJson(resume);

  return Handlebars.compile(resumeTemplate)({
    css: css,
    resume: resume
  });
}

module.exports = {
  render: render
};
