'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const path = require('path');

// Public node modules.
const _ = require('lodash');
const anchor = require('anchor');

// Local dependencies.
const WLValidationError = require('../../../node_modules/waterline/lib/waterline/error/WLValidationError');

// Settings for the Post model.
const settings = require('./Post.settings.json');

/**
 * Export the Post model
 */

module.exports = {

  /**
   * Basic settings
   */

  // The identity to use.
  identity: settings.identity,

  // The connection to use.
  connection: settings.connection,

  // Do you want to respect schema?
  schema: settings.schema,

  // Limit for a get request on the list.
  limit: settings.limit,

  // Merge simple attributes from settings with those ones.
  attributes: _.merge(settings.attributes, {

  }),

  // Do you automatically want to have time data?
  autoCreatedAt: settings.autoCreatedAt,
  autoUpdatedAt: settings.autoUpdatedAt,

  /**
   * Lifecycle callbacks on validate
   */

  // Before validating value
  beforeValidate: function (values, next) {
    // WARNING: Don't remove this part of code if you don't know what you are doing
    const api = path.basename(__filename, '.js').toLowerCase();

    if (strapi.api.hasOwnProperty(api) && _.size(strapi.api[api].templates)) {
      const template = strapi.api[api].templates.hasOwnProperty(values.template) ? values.template : strapi.models[api].defaultTemplate;
      const templateAttributes = _.merge(_.pick(strapi.models[api].attributes, 'lang'), strapi.api[api].templates[template].attributes);

      // Handle Waterline double validate
      if (_.size(_.keys(values)) === 1 && !_.includes(_.keys(templateAttributes), _.keys(values)[0])) {
        next();
      } else {
        const errors = {};

        // Set template with correct value
        values.template = template;
        values.lang = _.includes(strapi.config.i18n.locales, values.lang) ? values.lang : strapi.config.i18n.defaultLocale;

        _.forEach(templateAttributes, function (rules, key) {
          if (values.hasOwnProperty(key)) {
            // Check rules
            const test = anchor(values[key]).to(rules);

            if (test) {
              errors[key] = test;
            }
          } else if (rules.required) {
            errors[key] = [{
              rule: 'required',
              message: 'Missing attributes ' + key
            }];
          }
        });

        // Go next step or not
        _.isEmpty(errors) ? next() : next(new WLValidationError({
          invalidAttributes: errors,
          model: api
        }));
      }
    } else if (strapi.api.hasOwnProperty(api) && !_.size(strapi.api[api].templates)) {
      next();
    } else {
      next(new Error('Unknow API or no template detected'));
    }
  }

  /**
   * Lifecycle callbacks on create
   */

  // Before creating a value.
  // beforeCreate: function (values, next) {
  //   next();
  // },

  // After creating a value.
  // afterCreate: function (newlyInsertedRecord, next) {
  //   next();
  // },

  /**
   * Lifecycle callbacks on update
   */

  // Before updating a value.
  // beforeUpdate: function (valuesToUpdate, next) {
  //   next();
  // },

  // After updating a value.
  // afterUpdate: function (updatedRecord, next) {
  //   next();
  // },

  /**
   * Lifecycle callbacks on destroy
   */

  // Before updating a value.
  // beforeDestroy: function (criteria, next) {
  //   next();
  // },

  // After updating a value.
  // afterDestroy: function (destroyedRecords, next) {
  //   next();
  // }
};
