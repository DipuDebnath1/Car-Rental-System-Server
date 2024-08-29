import mongoose from 'mongoose';

export type TBookingCar = {
  date: string;
  startTime: string;
  endTime: string;
  user: mongoose.Types.ObjectId;
  car: mongoose.Types.ObjectId;
  totalCost: number;
};
