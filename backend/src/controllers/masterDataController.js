// src/controllers/masterDataController.js

import * as mdService from '../services/masterDataService.js';
import { sendSuccess } from '../utils/response.js';

// ==================== Department ====================
export const getDepartments = async (req, res, next) => {
  try {
    const data = await mdService.getDepartmentsService();
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const createDepartment = async (req, res, next) => {
  try {
    const data = await mdService.createDepartmentService(req.body, req.user.id, req.ip);
    sendSuccess(res, data, 201);
  } catch (err) { next(err); }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const data = await mdService.updateDepartmentService(Number(req.params.id), req.body, req.user.id, req.ip);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    await mdService.deleteDepartmentService(Number(req.params.id), req.user.id, req.ip);
    sendSuccess(res, null);
  } catch (err) { next(err); }
};

// ==================== Work Shift ====================
export const getWorkShifts = async (req, res, next) => {
  try {
    const data = await mdService.getWorkShiftsService();
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const createWorkShift = async (req, res, next) => {
  try {
    const data = await mdService.createWorkShiftService(req.body, req.user.id, req.ip);
    sendSuccess(res, data, 201);
  } catch (err) { next(err); }
};

export const updateWorkShift = async (req, res, next) => {
  try {
    const data = await mdService.updateWorkShiftService(Number(req.params.id), req.body, req.user.id, req.ip);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const deleteWorkShift = async (req, res, next) => {
  try {
    await mdService.deleteWorkShiftService(Number(req.params.id), req.user.id, req.ip);
    sendSuccess(res, null);
  } catch (err) { next(err); }
};

// ==================== Holiday ====================
export const getHolidays = async (req, res, next) => {
  try {
    const result = await mdService.getHolidaysService(req.query);
    sendSuccess(res, result.holidays, 200, result.pagination);
  } catch (err) { next(err); }
};

export const createHoliday = async (req, res, next) => {
  try {
    const data = await mdService.createHolidayService(req.body, req.user.id, req.ip);
    sendSuccess(res, data, 201);
  } catch (err) { next(err); }
};

export const deleteHoliday = async (req, res, next) => {
  try {
    await mdService.deleteHolidayService(Number(req.params.id), req.user.id, req.ip);
    sendSuccess(res, null);
  } catch (err) { next(err); }
};

// ==================== WiFi Whitelist ====================
export const getWifiWhitelist = async (req, res, next) => {
  try {
    const data = await mdService.getWifiWhitelistService();
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const createWifi = async (req, res, next) => {
  try {
    const data = await mdService.createWifiService(req.body, req.user.id, req.ip);
    sendSuccess(res, data, 201);
  } catch (err) { next(err); }
};

export const deleteWifi = async (req, res, next) => {
  try {
    await mdService.deleteWifiService(Number(req.params.id), req.user.id, req.ip);
    sendSuccess(res, null);
  } catch (err) { next(err); }
};
