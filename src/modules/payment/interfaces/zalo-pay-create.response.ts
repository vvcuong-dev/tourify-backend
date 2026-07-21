export interface ZaloPayCreateResponse {
  return_code: number;
  return_message: string;
  order_url?: string;
  zp_trans_token?: string;
}
