'use strict';

/**
 * This Service exposes the contract with the 'countries' data
 *
 * @author      ritesh
 * @version     1.0.0
 */

var countryData = require('country-data');
var errors = require('common-errors');

/**
 * Get all the countries list
 * @param  {Function}     callback        callback function
 */
exports.getAll = function(callback) {
  var countries = countryData.countries;
  callback(null, countries.all);
};

exports.validateCountry = function(country, callback) {
  var lookup = countryData.lookup;
  var countries = lookup.countries({name: country.name});
  if(!countries || countries.length === 0) {
    return callback(new errors.ValidationError('Invalid country'));
  } else if(countries.length !== 1) {
    return callback(new errors.ValidationError('Country ambiguously defined'));
  }
  callback(null, countries[0]);
};