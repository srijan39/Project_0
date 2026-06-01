import { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors: string[] | undefined;

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((error: any) => error.message);
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 400;
    const fields = Object.keys(err.keyValue || {}).join(", ");
    message = fields ? `Duplicate value for ${fields}` : "Duplicate key error";
  }

  if (err.name === "MongoBulkWriteError" || err.name === "BulkWriteError") {
    statusCode = 400;
    message = "Bulk insert failed";
    errors = err.writeErrors?.map((writeError: any) => {
      return writeError.errmsg || writeError.message || "Bulk write error";
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

export default errorHandler;
