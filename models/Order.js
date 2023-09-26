const { Schema, models, model } = require('mongoose')

const OrderSchema = new Schema({
  items: Object,
  name: String,
  email: String,
  city: String,
  postalCode: String,
  streetAddress: String,
  country: String,
  paid: Boolean
}, {
  timestamps: true
})

export const Order = models?.Order || model('Order', OrderSchema)