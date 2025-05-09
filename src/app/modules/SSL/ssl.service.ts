import config from '../../../config';
import AppError from '../../errors/AppError';
import status from 'http-status';
import { IPaymentData } from './ssl.interface';
import SSLCommerzPayment from 'sslcommerz-lts';

const initPayment = async (paymentData: IPaymentData) => {
  try {
    if (
      !config.ssl.store_id ||
      !config.ssl.store_password ||
      !config.ssl.success_url ||
      !config.ssl.fail_url ||
      !config.ssl.cancel_url
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        'SSL payment configuration is missing'
      );
    }

    const store_id = config.ssl.store_id;
    const store_passwd = config.ssl.store_password;
    const is_live = config.env === 'production' ? true : false;

    const data = {
      total_amount: paymentData.amount,
      currency: 'BDT',
      tran_id: paymentData.transactionId,
      success_url: config.ssl.success_url,
      fail_url: config.ssl.fail_url,
      cancel_url: config.ssl.cancel_url,
      ipn_url: config.ssl.ipn_url || 'http://localhost:5000/api/v1/payment/ipn',
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
      value_a: paymentData.reviewId,
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const sslResponse = await sslcz.init(data);

    return sslResponse;
  } catch (err) {
    throw new AppError(status.BAD_REQUEST, 'Payment error occurred!');
  }
};

const validatePayment = async (payload: any) => {
  try {
    if (!config.ssl.store_id || !config.ssl.store_password) {
      throw new AppError(
        status.BAD_REQUEST,
        'SSL validation configuration is missing'
      );
    }

    const store_id = config.ssl.store_id;
    const store_passwd = config.ssl.store_password;
    const is_live = false; // Set to true in production

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const response = await sslcz.validate({
      val_id: payload.val_id,
    });

    return response;
  } catch (err) {
    throw new AppError(status.BAD_REQUEST, 'Payment validation failed!');
  }
};

export const SSLService = {
  initPayment,
  validatePayment,
};
