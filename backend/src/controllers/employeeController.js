// src/controllers/employeeController.js

import * as employeeService from '../services/employeeService.js';
import { sendSuccess } from '../utils/response.js';

export const getEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.getEmployeesService(req.query);
    sendSuccess(res, result.employees, 200, result.pagination);
  } catch (err) {
    next(err);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeByIdService(Number(req.params.id));
    sendSuccess(res, employee);
  } catch (err) {
    next(err);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployeeService(req.body, req.user.id, req.clientIp || req.ip);
    sendSuccess(res, employee, 201);
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployeeService(Number(req.params.id), req.body, req.user.id, req.clientIp || req.ip);
    sendSuccess(res, employee);
  } catch (err) {
    next(err);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    await employeeService.deleteEmployeeService(Number(req.params.id), req.user.id, req.clientIp || req.ip);
    sendSuccess(res, null);
  } catch (err) {
    next(err);
  }
};
