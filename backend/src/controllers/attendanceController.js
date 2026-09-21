// src/controllers/attendanceController.js

import * as attendanceService from '../services/attendanceService.js';
import { sendSuccess } from '../utils/response.js';
import { getClientIp } from '../utils/ip.js';

export const checkIn = async (req, res, next) => {
  try {
    const data = await attendanceService.checkInService(req.user, req.clientIp || req.ip);
    sendSuccess(res, data, 201, null, 'เช็คอินสำเร็จ');
  } catch (err) {
    next(err);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const data = await attendanceService.checkOutService(req.user, req.clientIp || req.ip);
    sendSuccess(res, data, 200, null, 'เช็คเอาต์สำเร็จ');
  } catch (err) {
    next(err);
  }
};

export const getTodayStatus = async (req, res, next) => {
  try {
    const clientIp = getClientIp(req);
    const data = await attendanceService.getTodayStatusService(req.user.id, req.user.workShift, clientIp);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const getMyHistory = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const data = await attendanceService.getMyAttendanceHistoryService(req.user.id, { month, year });
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
