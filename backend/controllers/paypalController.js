import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import axios from "axios"; // npm install axios
import moment from "moment"; // npm install moment
import crypto from "crypto";
import crc32 from "buffer-crc32";
import fs from "fs/promises";
import Order from "../models/order.js";
import redisClient from "../utils/redisClient.js"; // Import Redis client
console.log(process.env.PAYPAL_CLIENT_ID);
const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_BASE,
  PAYPAL_WEBHOOK_ID,
} = process.env;
const FRONTEND_URL =
  process.env.NODE_ENV === "DEVELOPMENT"
    ? `${process.env.FRONTEND_PUB_URL}`
    : `${process.env.FRONTEND_PROD_URL}`;
const BACKEND_URL =
  process.env.NODE_ENV === "DEVELOPMENT"
    ? `${process.env.BACKEND_PUB_URL}`
    : `${process.env.BACKEND_PROD_URL}`;
/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
// Tạo token cho phiên thanh toán trên paypal
const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
    ).toString("base64");

    const options = {
      method: "post",
      url: `${PAYPAL_BASE}/v1/oauth2/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      data: "grant_type=client_credentials",
    };
    const response = await axios(options);
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
// Tạo payment mới trên cổng thanh toán của paypal
export const newPaypalPayment = catchAsyncErrors(async (req, res, next) => {
  try {
    //const { cart } = req.body;
    // use the cart information passed from the front-end to calculate the purchase unit details
    // console.log(
    //   "shopping cart information passed from the frontend createOrder() callback:",
    //   cart
    // );

    const accessToken = await generateAccessToken();
    //console.log("accessToken", accessToken);

    const transID =
      moment().format("YYMMDDHHMMSS") +
      (req.body.user ? req.body.user : 113114115) +
      "PP";

    // const orderInfo = `FakeshionShop - Thanh toán cho đơn hàng #${transID}`;

    // const DataRaw = {
    //   orderItems: req.body.orderItems,
    //   shippingInfo: {
    //     orderID: transID,
    //     address: req.body.shippingInfo.address,
    //     phoneNo: req.body.shippingInfo.phoneNo,
    //   },
    //   itemsPrice: req.body.itemsPrice,
    //   shippingAmount: req.body.shippingAmount,
    //   totalAmount: req.body.totalAmount,
    //   paymentMethod: req.body.paymentMethod,
    //   paymentInfo: req.body.paymentInfo,
    //   user: req.body.user,
    // };

    // const payload = {
    //   intent: "CAPTURE",
    //   purchase_units: [
    //     {
    //       reference_id:transID,
    //       description: orderInfo,
    //       custom_id: transID,
    //       invoice_id: transID,
    //       amount: { currency_code: "USD", value: req.body.shippingAmount/1000 },
    //     },
    //   ],
    //   payment_source: {
    //     paypal: {
    //       experience_context: {
    //         payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
    //         brand_name: "FAKESHION SHOP INC",
    //         locale: "en-US",
    //         landing_page: "NO_PREFERENCE",
    //         //shipping_preference: "SET_PROVIDED_ADDRESS",
    //         user_action: "PAY_NOW",
    //         locale: "en-US",
    //         return_url: BACKEND_URL + "/api/paypal/callback/",
    //         cancel_url: FRONTEND_URL + "/cart",
    //       },
    //     },
    //   },
    // };

    //tạo payload từ req.body ở đây
    // const payload = {
    //   intent: "CAPTURE",
    //   purchase_units: [
    //     {
    //       amount: {
    //         currency_code: "USD",
    //         value: "100",
    //       },
    //     },
    //   ],
    // };

    const prepairedItems = req.body.orderItems.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      sku: i.product,
      description: `${i.selectedVariant.variantID}-${i.selectedVariant.color}-${i.selectedVariant.size}-${i.selectedVariant.stock}`,
      image_url: i.image,
      unit_amount: {
        currency_code: "USD",
        value: i.price / 1000,
      },
    }));
    // console.log("day la i", prepairedItems);

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: transID,
          description: `${[
            req.body.shippingInfo?.address,
            req.body.shippingInfo?.shippingWard,
            req.body.shippingInfo?.shippingCity,
            req.body.shippingInfo?.shippingProvince,
            req.body.shippingInfo?.shippingVender,
          ]
            .filter(Boolean)
            .join(", ")}-${req.body.shippingInfo.phoneNo}`,
          custom_id: req.body.user,
          invoice_id: transID,
          amount: {
            currency_code: "USD",
            value: req.body.totalAmount / 1000,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: req.body.itemsPrice / 1000,
              },
              shipping: {
                currency_code: "USD",
                value: req.body.shippingAmount / 1000,
              },
            },
          },
          items: prepairedItems,
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "UNRESTRICTED",
            brand_name: "FAKESHION SHOP INC",
            locale: "en-US",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            // locale: "en-VN",
            return_url: `${FRONTEND_URL}/me/orders?order_success=true`,
            cancel_url: `${FRONTEND_URL}/me/orders?order_success=false`,
          },
        },
      },
    };
    // console.log("day la amount", payload.purchase_units[0].amount);
    // console.log(payload);

    const options = {
      method: "post",
      url: `${PAYPAL_BASE}/v2/checkout/orders`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // Uncomment one of these to force an error for negative testing (in sandbox mode only).
        // Documentation: https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
        // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
        Prefer: "return=representation",
      },
      data: JSON.stringify(payload),
    };
    const response = await axios(options);
    // console.log(response, response.status, response.data);
    console.log(response.data);
    res.status(response.status).json(response.data);
  } catch {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
});

// // createOrder route
// app.post("/api/orders", async (req, res) => {
//   try {
//     // use the cart information passed from the front-end to calculate the order amount detals
//     const { cart } = req.body;
//     const { jsonResponse, httpStatusCode } = await createOrder(cart);
//     res.status(httpStatusCode).json(jsonResponse);
//   } catch (error) {
//     console.error("Failed to create order:", error);
//     res.status(500).json({ error: "Failed to create order." });
//   }
// });

// // serve index.html
// app.get("/", (req, res) => {
//   res.sendFile(path.resolve("./checkout.html"));
// });

async function downloadAndCache(url, cacheKey) {
  if (!cacheKey) {
    cacheKey = url.replace(/\W+/g, "-");
  }
  const filePath = `${"backend/controllers/paypalCached"}/${cacheKey}`;

  // Check if cached file exists
  const cachedData = await fs.readFile(filePath, "utf-8").catch(() => null);
  if (cachedData) {
    return cachedData;
  }

  // Download the file if not cached
  // const response = await fetch(url);
  // const data = await response.text();
  const data = (await axios.get(url)).text();

  await fs.writeFile(filePath, data);

  return data;
}

async function verifySignature(event, headers) {
  const transmissionId = headers["paypal-transmission-id"];
  const timeStamp = headers["paypal-transmission-time"];
  const crc = parseInt("0x" + crc32(event).toString("hex")); // hex crc32 of raw event data, parsed to decimal form

  const message = `${transmissionId}|${timeStamp}|${PAYPAL_WEBHOOK_ID}|${crc}`;
  // console.log(`Original signed message ${message}`);

  const certPem = await downloadAndCache(headers["paypal-cert-url"]);
  // console.log(certPem);
  // Create buffer from base64-encoded signature
  const signatureBuffer = Buffer.from(
    headers["paypal-transmission-sig"],
    "base64"
  );
  // console.log(signatureBuffer);
  // Create a verification object
  const verifier = crypto.createVerify("SHA256");

  // Add the original message to the verifier
  verifier.update(message);

  return verifier.verify(certPem, signatureBuffer);
}

// Paypal callback để hệ thống update lại đơn hàng đã tạo trên database sau khi nhận được xác nhận giao dịch thành công từ paypal
export const newOrderWithPaypal = catchAsyncErrors(async (req, res, next) => {
  const headers = req.headers;
  // console.log("day la hd", req.headers)
  // const event = req.body;
  const event = req.rawBody;
  // console.log("day la bd", req.body)
  // console.log("day la raw bd", req.rawBody)
  // console.log("day la raw bd", JSON.parse(req.rawBody))
  const data = JSON.parse(event);

  // console.log(`headers`, headers);
  // console.log(`parsed json`, JSON.stringify(data, null, 2));
  // console.log(`raw event: ${event}`);

  const isSignatureValid = await verifySignature(event, headers);
  // console.log(isSignatureValid);
  if (isSignatureValid) {
    console.log("Signature is valid.");

    // Successful receipt of webhook, do something with the webhook data here to process it, e.g. write to database
    // console.log(`Received event`, JSON.stringify(data, null, 2));
    // console.log(data?.resource?.purchase_units[0]?.items)
    const ordersItemsData = data?.resource?.purchase_units[0]?.items.map(
      (i) => ({
        name: i?.name,
        quantity: i?.quantity,
        image: i?.image_url,
        product: i?.sku,
        price: i?.unit_amount?.value * 1000,
        selectedVariant: {
          color: i?.description.split("-")[1],
          size: i?.description.split("-")[2],
          stock: i?.description.split("-")[3],
          variantID: i?.description.split("-")[0],
        },
      })
    );
    // console.log("ordersItemsData", ordersItemsData);
    const orderData = {
      orderItems: ordersItemsData,
      shippingInfo: {
        orderID: data?.resource?.purchase_units[0]?.reference_id,
        address: data?.resource?.purchase_units[0]?.description.split(", ")[0],
        phoneNo: data?.resource?.purchase_units[0]?.description
          .split(", ")[4]
          .split("-")[1],
        shippingProvince:
          data?.resource?.purchase_units[0]?.description.split(", ")[3],
        shippingCity:
          data?.resource?.purchase_units[0]?.description.split(", ")[2],
        shippingWard:
          data?.resource?.purchase_units[0]?.description.split(", ")[1],
        shippingVender: data?.resource?.purchase_units[0]?.description
          .split(", ")[4]
          .split("-")[0],
      },
      itemsPrice:
        data?.resource?.purchase_units[0]?.amount?.breakdown?.item_total
          ?.value * 1000,
      shippingAmount:
        data?.resource?.purchase_units[0]?.amount?.breakdown?.shipping?.value *
        1000,
      totalAmount: data?.resource?.purchase_units[0]?.amount?.value * 1000,
      paymentMethod: "Card",
      paymentInfo: {
        status: "Đã thanh toán",
      },
      orderStatus: "Processing",
      user: data?.resource?.purchase_units[0]?.custom_id,
    };
    // console.log("orderData", orderData);
    const order = await Order.create(orderData);
    // const order = await Order.create({
    //   orderItems: ordersItemsData,
    //   shippingInfo: {
    //     orderID: data?.resource?.purchase_units[0]?.reference_id,
    //     address: data?.resource?.purchase_units[0]?.description.split(", ")[0],
    //     phoneNo: data?.resource?.purchase_units[0]?.description
    //       .split(", ")[3]
    //       .split("-")[1],
    //     shippingProvince: data?.resource?.purchase_units[0]?.description
    //       .split(", ")[3]
    //       .split("-")[0],
    //     shippingCity:
    //       data?.resource?.purchase_units[0]?.description.split(", ")[2],
    //     shippingWard:
    //       data?.resource?.purchase_units[0]?.description.split(", ")[1],
    //     shippingVender:
    //       data?.resource?.purchase_units[0]?.description.split(", ")[4],
    //   },
    //   itemsPrice:
    //     data?.resource?.purchase_units[0]?.amount?.breakdown?.item_total
    //       ?.value * 1000,
    //   shippingAmount:
    //     data?.resource?.purchase_units[0]?.amount?.breakdown?.shipping?.value *
    //     1000,
    //   totalAmount: data?.resource?.purchase_units[0]?.amount?.value * 1000,
    //   paymentMethod: "Card",
    //   paymentInfo: {
    //     status: "Đã thanh toán",
    //   },
    //   orderStatus: "Processing",
    //   user: data?.resource?.purchase_units[0]?.custom_id,
    // });
    // Invalidate cache for myOrders and allOrders
    await redisClient.del(
      `myOrders:${data?.resource?.purchase_units[0]?.custom_id}`
    );
    await redisClient.del("allOrders");

    console.log(order);
  } else {
    console.log(
      `Signature is not valid for ${data?.id} ${headers?.["correlation-id"]}`
    );
    // Reject processing the webhook event. May wish to log all headers+data for debug purposes.
  }

  // Return a 200 response to mark successful webhook delivery
  res.sendStatus(200);

  // try {
  //   const accessToken = await generateAccessToken();
  //   //console.log("accessToken", accessToken);

  //   const options = {
  //     method: "post",
  //     url: `${PAYPAL_BASE}/v2/checkout/orders/${req.query.token}/capture`,
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //       Prefer: "return=representation",
  //     },
  //   };
  //   const response = await axios(options);
  //   console.log(response, response.status, response.data);
  //   //TẠO ĐƠN HÀNG LÊN HỆ THỐNG Ở ĐÂY-NHỚ CHECK ĐƠN HÀNG TRÙNG
  //   res.status(response.status).json(response.data);
  //   res.redirect(`${FRONTEND_URL}/me/orders?order_success=true`);
  // } catch (error) {
  //   console.error("Failed to create order:", error);
  //   res.status(500).json({ error: "Failed to create order." });
  // }
});
