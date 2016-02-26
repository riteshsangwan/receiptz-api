'use strict';

/**
 * Organization schema definition.
 * A organization instance represent a organization in the system.
 * Organization means any entity which is generating receipts to be sent to customers
 * Staff of the organization can be classified as staff or both.
 * This means a user who is a staff of organization is also a consumer for some services
 * and that receipts have to be sent to him.
 *
 * @author      ritesh
 * @version     1.0.0
 */

var mongoose = require('../datasource').getMongoose(),
  Schema = mongoose.Schema;

var OrganizationSchema = new Schema({
  name: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: {type: Schema.Types.Mixed, required: true},
  tax: { type: Number, required: true },
  zipCode: { type: String, required: true }
});

/**
 * Module exports
 */
module.exports = {
  OrganizationSchema: OrganizationSchema
};