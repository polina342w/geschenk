import {SignJWT,jwtVerify} from 'jose';
import {timingSafeEqual} from 'node:crypto';

const encoder=new TextEncoder();
function sessionSecret(){if(!process.env.SESSION_SECRET)throw new Error('SESSION_SECRET fehlt.');return encoder.encode(process.env.SESSION_SECRET)}
export function validAdminSecret(value=''){
  const expected=String(process.env.ADMIN_UPLOAD_SECRET||'');
  const actual=String(value||'');
  if(!expected||actual.length!==expected.length)return false;
  return timingSafeEqual(Buffer.from(actual),Buffer.from(expected));
}
export async function createAdminSession(){return new SignJWT({role:'admin'}).setProtectedHeader({alg:'HS256'}).setSubject('gift-admin').setIssuedAt().setExpirationTime('2h').sign(sessionSecret())}
export function adminCookie(token){return `gift_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200`}
export function clearAdminCookie(){return 'gift_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'}
export async function readAdminSession(request){const cookie=request.headers.cookie||'';const token=cookie.split(';').map(value=>value.trim()).find(value=>value.startsWith('gift_admin='))?.slice(11);if(!token)return null;try{const {payload}=await jwtVerify(token,sessionSecret());return payload.role==='admin'?payload:null}catch{return null}}
