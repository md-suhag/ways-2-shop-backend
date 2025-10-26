import { Request, Response } from "express";
import { WalletService } from "./wallet.service";
import catchAsync from "../../../shared/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const getWalletBalance = catchAsync(async (req: Request, res: Response) => {
  const result = await WalletService.getWalletBalance(req.user as JwtPayload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Wallet balance retrieved Successfully",
    data: result,
  });
});

const withdraw = catchAsync(async (req: Request, res: Response) => {
  const result = await WalletService.withdraw(
    req.user as JwtPayload,
    req.body.amount
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Withdraw successfull",
    data: result,
  });
});

export const WalletController = { getWalletBalance, withdraw };
