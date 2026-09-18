// src/controllers/leaveController.js

import * as leaveService from '../services/leaveService.js';
import { sendSuccess } from '../utils/response.js';

// ==================== Employee Endpoints ====================

export const getMyBalances = async (req, res, next) => {
  try {
    const data = await leaveService.getMyLeaveBalances(req.user.id, Number(req.query.year) || new Date().getFullYear());
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const result = await leaveService.getMyLeaveRequests(req.user.id, req.query);
    sendSuccess(res, result.requests, 200, result.pagination);
  } catch (err) { next(err); }
};

export const createRequest = async (req, res, next) => {
  try {
    const data = await leaveService.createLeaveRequest(req.user.id, req.body, req.clientIp || req.ip);
    sendSuccess(res, data, 201, null, 'ยื่นใบลาสำเร็จ');
  } catch (err) { next(err); }
};

// ==================== Admin Endpoints ====================

export const getAllRequests = async (req, res, next) => {
  try {
    const result = await leaveService.getAllLeaveRequests(req.query);
    sendSuccess(res, result.requests, 200, result.pagination);
  } catch (err) { next(err); }
};

export const processRequest = async (req, res, next) => {
  try {
    const data = await leaveService.processLeaveRequest(Number(req.params.id), req.body, req.user.id, req.clientIp || req.ip);
    sendSuccess(res, data, 200, null, 'ดำเนินการใบลาสำเร็จ');
  } catch (err) { next(err); }
};

export const getEmployeeBalances = async (req, res, next) => {
  try {
    const data = await leaveService.getEmployeeLeaveBalances(Number(req.params.employeeId), Number(req.query.year) || new Date().getFullYear());
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const updateBalance = async (req, res, next) => {
  try {
    const { leaveType, year, totalDays } = req.body;
    const data = await leaveService.updateLeaveBalance(Number(req.params.employeeId), leaveType, year, totalDays, req.user.id, req.clientIp || req.ip);
    sendSuccess(res, data, 200, null, 'อัปเดตยอดวันลาสำเร็จ');
  } catch (err) { next(err); }
};
