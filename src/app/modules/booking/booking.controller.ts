/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler } from 'express';
import catchAsync from '../../utills/catchAsync';
import { booking } from './booking.service';
import sendResponse from '../../utills/sendResponse';
import httpStatus from 'http-status';
import config from '../../../config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../../ErrorHandler/AppError';

const GetAllBookingCar: RequestHandler = catchAsync(async (req, res, next) => {
  const { carId, date } = req.query;
  const result = await booking.getAllBookingCarFromDB(
    carId as string,
    date as string,
  );
  if (!result) {
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'find all booking Cars not found',
      data: [],
    });
    return;
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

const BookingACar: RequestHandler = catchAsync(async (req, res, next) => {
  // const  decoded = jwt.verify(req?.headers?.authorization?.split(' ')[1] as string, config.accessToken as string);
  const token = req?.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError(httpStatus.UNAUTHORIZED, 'No token provided'));
  }

  const decoded = jwt.verify(
    token,
    config.accessToken as string,
  ) as JwtPayload & { data: { _id: string } };

  const result = await booking.bookingACarIntoDB(decoded.data._id, req.body);

  if (!result) {
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Cars booking false',
      data: [],
    });
    return;
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings booked successfully',
    data: result,
  });
});

const FindUserBookings: RequestHandler = catchAsync(async (req, res, next) => {
  // const decoded = jwt.verify(req?.headers.authorization?.split(' ')[1] as string, config.accessToken as string)
  const token = req?.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError(httpStatus.UNAUTHORIZED, 'No token provided'));
  }

  const decoded = jwt.verify(
    token,
    config.accessToken as string,
  ) as JwtPayload & { data: { _id: string } };

  const result = await booking.findUserBookingsCarFromDB(decoded.data._id);

  if (!result) {
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'your booking Cars not found',
      data: [],
    });
    return;
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'My Bookings retrieved successfully',
    success: true,
    data: result,
  });
});

const ReturnBookingCar: RequestHandler = catchAsync(async (req, res, next) => {
  const result = await booking.returnBookingCarFromDB(req.body);

  if (!result) {
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'your booking Cars not found',
      data: [],
    });
    return;
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Car returned successfully',
    data: result,
  });
});

export const BookingController = {
  BookingACar,
  GetAllBookingCar,
  FindUserBookings,
  ReturnBookingCar,
};
