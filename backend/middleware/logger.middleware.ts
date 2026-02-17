import { Request, Response, NextFunction } from "express";

const MAX_LOG_LENGTH = 2000;

function truncate(obj: any) {
  try {
    const s = typeof obj === "string" ? obj : JSON.stringify(obj);
    return s.length > MAX_LOG_LENGTH ? s.slice(0, MAX_LOG_LENGTH) + "... (truncated)" : s;
  } catch (e) {
    return "[Unserializable]";
  }
}

function sanitizeHeaders(headers: any) {
  const h = { ...headers };
  if (h.authorization) h.authorization = "[REDACTED]";
  if (h.cookie) h.cookie = "[REDACTED]";
  return h;
}

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  const safeHeaders = sanitizeHeaders(req.headers || {});
  const parts: string[] = [];
  parts.push(`→ [Request] ${method} ${originalUrl}`);
  parts.push(`Headers: ${truncate(safeHeaders)}`);

  if (method === "GET" || method === "DELETE") {
    if (req.query && Object.keys(req.query).length) {
      parts.push(`Query: ${truncate(req.query)}`);
    }
  } else {
    if (req.body !== undefined) {
      parts.push(`Body: ${truncate(req.body)}`);
    }
  }

  console.log(parts.join(" | "));

  // Capture response body by wrapping res.send
  const originalSend = (res as any).send;
  let responseBody: any;
  (res as any).send = function (body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const level = statusCode >= 500 ? "ERROR" : statusCode >= 400 ? "WARN" : "INFO";
    console.log(`← [${level}] ${method} ${originalUrl} ${statusCode} - ${duration}ms`);
    if (responseBody !== undefined) {
      console.log(`   Response: ${truncate(responseBody)}`);
    }
  });

  res.on("close", () => {
    const duration = Date.now() - start;
    console.log(`✖ [ABORT] ${method} ${originalUrl} - closed after ${duration}ms`);
  });

  next();
};

export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    const safeHeaders = sanitizeHeaders(req.headers || {});
    console.error(`❌ [ERROR] ${req.method} ${req.originalUrl} - ${err.message}`);
    console.error(`   Headers: ${truncate(safeHeaders)}`);
    if (req.body !== undefined) {
      console.error(`   Body: ${truncate(req.body)}`);
    }
    if (err.stack) {
      console.error(err.stack);
    }
  } catch (e) {
    console.error("❌ [ERROR] Failed to log error", e);
  }
  next(err);
};

export default requestLogger;
