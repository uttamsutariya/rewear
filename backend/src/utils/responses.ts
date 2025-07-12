import { Response } from "express";

interface SuccessResponse<T = any> {
	success: true;
	data: T;
	message?: string;
}

interface ErrorResponse {
	success: false;
	error: string;
	message: string;
	details?: any;
}

export const sendSuccess = <T = any>(res: Response, data: T, message?: string, statusCode: number = 200): Response => {
	const response: SuccessResponse<T> = {
		success: true,
		data,
		...(message && { message }),
	};
	return res.status(statusCode).json(response);
};

export const sendError = (
	res: Response,
	error: string,
	message: string,
	statusCode: number = 500,
	details?: any,
): Response => {
	const response: ErrorResponse = {
		success: false,
		error,
		message,
		...(details && { details }),
	};
	return res.status(statusCode).json(response);
};

export const sendCreated = <T = any>(
	res: Response,
	data: T,
	message: string = "Resource created successfully",
): Response => {
	return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): Response => {
	return res.status(204).send();
};
