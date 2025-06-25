import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  return res
  .status(200)
  .json(new APIresponse(200, {"status" : "ok"}, "Server is Healthy"))
});

export { healthcheck };