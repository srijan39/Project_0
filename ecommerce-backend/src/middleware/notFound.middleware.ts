import { Request, Response, NextFunction } from "express";

const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`) as any;
error.statusCode = 404;
next(error);
};

export default notFound;