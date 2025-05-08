import axios from 'axios';
import config from '../../../config';
import AppError from '../../errors/AppError';
import status from 'http-status';
import { IPaymentData } from './ssl.interface';

const initPayment = async (paymentData: IPaymentData) => {
  try {
    // We need to add SSL config to the config file
    if (
      !process.env.SSL_STORE_ID ||
      !process.env.SSL_STORE_PASSWORD ||
      !process.env.SSL_PAYMENT_API ||
      !process.env.SSL_VALIDATION_API ||
      !process.env.SSL_SUCCESS_URL ||
      !process.env.SSL_FAIL_URL ||
      !process.env.SSL_CANCEL_URL
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        'SSL payment configuration is missing'
      );
    }

    const data = {
      store_id: process.env.SSL_STORE_ID,
      store_passwd: process.env.SSL_STORE_PASSWORD,
      total_amount: paymentData.amount,
      currency: 'BDT',
      tran_id: paymentData.transactionId,
      success_url: process.env.SSL_SUCCESS_URL,
      fail_url: process.env.SSL_FAIL_URL,
      cancel_url: process.env.SSL_CANCEL_URL,
      ipn_url:
        process.env.SSL_IPN_URL || 'http://localhost:5000/api/v1/payment/ipn',
      shipping_method: 'N/A',
      product_name: 'Premium Review',
      product_category: 'Digital Content',
      product_profile: 'general',
      cus_name: paymentData.name,
      cus_email: paymentData.email,
      cus_add1: paymentData.address || 'N/A',
      cus_add2: 'N/A',
      cus_city: 'N/A',
      cus_state: 'N/A',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: paymentData.contactNumber || 'N/A',
      cus_fax: 'N/A',
      ship_name: 'N/A',
      ship_add1: 'N/A',
      ship_add2: 'N/A',
      ship_city: 'N/A',
      ship_state: 'N/A',
      ship_postcode: 1000,
      ship_country: 'N/A',
      value_a: paymentData.reviewId, // Store reviewId for reference
    };

    const response = await axios({
      method: 'post',
      url: process.env.SSL_PAYMENT_API,
      data: data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return response.data;
  } catch (err) {
    throw new AppError(status.BAD_REQUEST, 'Payment error occurred!');
  }
};

const validatePayment = async (payload: any) => {
  try {
    if (
      !process.env.SSL_VALIDATION_API ||
      !process.env.SSL_STORE_ID ||
      !process.env.SSL_STORE_PASSWORD
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        'SSL validation configuration is missing'
      );
    }

    const response = await axios({
      method: 'GET',
      url: `${process.env.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${process.env.SSL_STORE_ID}&store_passwd=${process.env.SSL_STORE_PASSWORD}&format=json`,
    });

    return response.data;
  } catch (err) {
    throw new AppError(status.BAD_REQUEST, 'Payment validation failed!');
  }
};

export const SSLService = {
  initPayment,
  validatePayment,
};
