// src/controllers/reportController.js

import * as reportService from '../services/reportService.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const data = await reportService.getDashboardSummaryService();
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year, departmentId } = req.query;
    if (!month || !year) throw new AppError('กรุณาระบุเดือนและปี', 400);

    const data = await reportService.getMonthlyReportDataService(Number(month), Number(year), departmentId);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const exportMonthlyReport = async (req, res, next) => {
  try {
    const { month, year, departmentId, format } = req.query;
    if (!month || !year) throw new AppError('กรุณาระบุเดือนและปี', 400);

    const data = await reportService.getMonthlyReportDataService(Number(month), Number(year), departmentId);
    
    if (format === 'csv') {
      const csv = reportService.generateCsvReportService(data);
      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.attachment(`Attendance_Report_${year}_${month}.csv`);
      return res.send(csv);
    } 
    
    // Default to Excel
    const buffer = await reportService.generateExcelReportService(data, month, year);
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment(`Attendance_Report_${year}_${month}.xlsx`);
    return res.send(buffer);

  } catch (err) { next(err); }
};
