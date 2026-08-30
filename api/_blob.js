export function privateBlobOptions(extra={}){
  const storeId=process.env.BLOB_STORE_ID||process.env.GESCHENK_BLOB_STORE_ID||process.env.ADMIN_UPLOAD_SECRET_STORE_ID;
  return storeId?{...extra,storeId}:{...extra};
}
