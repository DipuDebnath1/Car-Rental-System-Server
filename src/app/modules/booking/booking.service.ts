/* eslint-disable no-console */
import { CarCollection } from '../car/car.model';
import { BookingModel } from './booking.model';
import AppError from '../../ErrorHandler/AppError';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { TCarWithId } from '../car/car.interface';

type TCarOrder = {
  carId: string;
  date: string;
  startTime: string;
};
type TCarReturn = {
  bookingId: string;
  endTime: string;
};

// admin route
const getAllBookingCarFromDB = async (carId: string, date: string) => {
  const query: { car?: Types.ObjectId; date?: string } = {};

  if (carId) query.car = new Types.ObjectId(carId); // Convert carId to ObjectId
  if (date) query.date = date;

  try {
    const allBooking = await BookingModel.find(query)
      .populate('car')
      .populate('user')
      .exec();

    if (!allBooking) return;

    return allBooking;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

const returnBookingCarFromDB = async (payload: TCarReturn) => {
  const session = await BookingModel.startSession();

  try {
    session.startTransaction();

    const findBookingCar = await BookingModel.findById(payload.bookingId)
      .populate<{ car: TCarWithId }>('car')
      .populate('user')
      .session(session);

    if (!findBookingCar) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Car not found');
    }
    // car status update
    await CarCollection.findByIdAndUpdate(
      findBookingCar.car._id,
      { status: 'available' },
      { new: true },
    ).session(session);

    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    const startDate: Date = parseTime(findBookingCar.startTime);
    const endDate: Date = parseTime(payload.endTime);

    // Calculate the time difference in milliseconds
    const timeDifference = endDate.getTime() - startDate.getTime();

    // Convert milliseconds to hours (fractional)
    const millisecondsInAnHour = 1000 * 60 * 60;
    const hoursDifference = timeDifference / millisecondsInAnHour;
    const totalCost = hoursDifference * findBookingCar.car.pricePerHour;

    const result = await BookingModel.findByIdAndUpdate(
      payload.bookingId,
      { endTime: payload.endTime, totalCost: totalCost },
      { new: true },
    )
      .populate('car')
      .populate('user')
      .session(session);
    await session.commitTransaction();

    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// user route
const bookingACarIntoDB = async (
  userId: string,
  payload: Partial<TCarOrder>,
) => {
  const session = await BookingModel.startSession();

  try {
    session.startTransaction();

    const car = await CarCollection.findById(payload.carId).session(session);
    if (!car) {
      throw new AppError(httpStatus.NOT_FOUND, 'Car not found');
    }

    if (car.isDeleted) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Car already deleted');
    }

    if (car.status === 'unavailable') {
      throw new AppError(httpStatus.CONFLICT, 'Car is unavailable');
    }

    // Update the car status to 'unavailable'
    await CarCollection.findByIdAndUpdate(
      payload.carId,
      { status: 'unavailable' },
      { new: true, session },
    );

    // Create booking
    const bookingInfo = {
      car: payload.carId,
      date: payload.date,
      startTime: payload.startTime,
      user: userId,
    };
    const bookingResult = await BookingModel.create([bookingInfo], { session });

    // Populate the car and user information in the booking result
    const populatedBooking = await BookingModel.findById(bookingResult[0]._id)
      .populate('user')
      .populate('car')
      .session(session);

    await session.commitTransaction();
    return populatedBooking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const findUserBookingsCarFromDB = async (userId: string) => {
  const query: { user?: Types.ObjectId } = {};
  if (userId) query.user = new Types.ObjectId(userId);
  try {
    const allBooking = await BookingModel.find(query)
      .populate('car')
      .populate('user')
      .exec();

    if (!allBooking) return;

    return allBooking;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const booking = {
  bookingACarIntoDB,
  getAllBookingCarFromDB,
  findUserBookingsCarFromDB,
  returnBookingCarFromDB,
};
