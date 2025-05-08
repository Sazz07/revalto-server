import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import status from 'http-status';
import pick from '../../../shared/pick';
import { paginationKeys } from '../../constants';
import { reportFilterableFields } from './report.constant';
import { IAuthUser } from '../../interfaces/common';
import { ReportService } from './report.service';

const createReport = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await ReportService.createReport(req.body, req.user!.id);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Report submitted successfully',
      data: result,
    });
  }
);

const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, reportFilterableFields);
  const options = pick(req.query, paginationKeys);

  const result = await ReportService.getAllReports(filters, options);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Reports retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleReport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReportService.getSingleReport(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Report retrieved successfully',
    data: result,
  });
});

const updateReportStatus = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await ReportService.updateReportStatus(
      id,
      req.body,
      req.user!.id
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Report status updated successfully',
      data: result,
    });
  }
);

export const ReportController = {
  createReport,
  getAllReports,
  getSingleReport,
  updateReportStatus,
};
