import {SignJWT,jwtVerify} from 'jose';
const encoder=new TextEncoder();
function secret(){if(!process.env.SESSION_SECRET)throw new Error('SESSION_SECRET fehlt.');return encoder.encode(process.env.SESSION_SECRET)}
export async function createSession(user){return new SignJWT({username:user.username,name:user.display_name}).setProtectedHeader({alg:'HS256'}).setSubject(String(user.id)).setIssuedAt().setExpirationTime('7d').sign(secret())}
export async function readSession(request){const cookie=request.headers.cookie||'';const token=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('gift_session='))?.slice(13);if(!token)return null;try{return(await jwtVerify(token,secret())).payload}catch{return null}}
export function sessionCookie(token){return `gift_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`}
