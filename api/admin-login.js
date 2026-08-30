import {adminCookie,createAdminSession,validAdminSecret} from './_admin.js';
export default async function handler(request,response){
  if(request.method!=='POST')return response.status(405).json({error:'Methode nicht erlaubt.'});
  if(!validAdminSecret(request.body?.secret))return response.status(401).json({error:'Falsches Admin-Passwort.'});
  response.setHeader('Set-Cookie',adminCookie(await createAdminSession()));
  return response.status(200).json({ok:true});
}
