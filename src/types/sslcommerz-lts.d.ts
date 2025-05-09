declare module 'sslcommerz-lts' {
  interface SSLCommerzPaymentOptions {
    store_id: string;
    store_passwd: string;
    is_live: boolean;
  }

  interface SSLCommerzInitData {
    total_amount: number;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url?: string;
    shipping_method?: string;
    product_name?: string;
    product_category?: string;
    product_profile?: string;
    cus_name?: string;
    cus_email?: string;
    cus_add1?: string;
    cus_add2?: string;
    cus_city?: string;
    cus_state?: string;
    cus_postcode?: string;
    cus_country?: string;
    cus_phone?: string;
    cus_fax?: string;
    ship_name?: string;
    ship_add1?: string;
    ship_add2?: string;
    ship_city?: string;
    ship_state?: string;
    ship_postcode?: number;
    ship_country?: string;
    value_a?: string;
    value_b?: string;
    value_c?: string;
    value_d?: string;
    [key: string]: any;
  }

  interface SSLCommerzValidateData {
    val_id: string;
  }

  // Base response interface
  interface SSLCommerzResponse {
    status: string;
    failedreason?: string;
    sessionkey?: string;
    [key: string]: any;
  }

  // Success response interface with required GatewayPageURL
  interface SSLCommerzSuccessResponse extends SSLCommerzResponse {
    GatewayPageURL: string;
  }

  class SSLCommerzPayment {
    constructor(store_id: string, store_passwd: string, is_live: boolean);
    init(data: SSLCommerzInitData): Promise<SSLCommerzSuccessResponse>;
    validate(data: SSLCommerzValidateData): Promise<SSLCommerzResponse>;
    orderValidate(
      data: any,
      val_id: string,
      amount: number,
      currency: string
    ): Promise<SSLCommerzResponse>;
    transactionQueryBySessionId(
      sessionkey: string
    ): Promise<SSLCommerzResponse>;
    transactionQueryByTransactionId(
      tran_id: string
    ): Promise<SSLCommerzResponse>;
  }

  export default SSLCommerzPayment;
}
