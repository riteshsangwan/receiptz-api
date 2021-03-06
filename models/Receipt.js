'use strict';

/**
 * Receipt schema definition.
 * A receipt is generated by an organization.
 * A organization has no of stores. Each store has an id
 *
 * @author      ritesh
 * @version     1.0.0
 */

var mongoose = require('../datasource').getMongoose(),
  Schema = mongoose.Schema;

var ReceiptSchema = new Schema({
  orgId: { type: String, required: true },
  // staff id is the id of the logged in user who generated the receipt
  staffId: { type: String, required: true },
  amount: { type: Number, required: true },
  tax: { type: Number, required: true },
  type: { type: String, required: true, enum: ['purchase', 'return'] },
  // is the id of the user to which this receipt belongs
  userId: { type: String, required: false },
  mobileNumber: { type: String, required: false },
  items: { type: Schema.Types.Mixed, required: true }
});

/**
 * Module exports
 */
module.exports = {
  ReceiptSchema: ReceiptSchema
};