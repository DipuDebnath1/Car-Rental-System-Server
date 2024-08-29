import { model, Schema } from 'mongoose';
import { TBookingCar } from './booking.interface';

const bookingSchema = new Schema<TBookingCar>(
  {
    date: {
      type: String,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    car: {
      type: Schema.Types.ObjectId,
      ref: 'car',
    },
    totalCost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const BookingModel = model<TBookingCar>('BookingCar', bookingSchema);
