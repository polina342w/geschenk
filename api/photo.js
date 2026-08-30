import {get} from '@vercel/blob';
import {Readable} from 'node:stream';
import {readSession} from './_auth.js';
import {privateBlobOptions} from './_blob.js';
import {database} from './_profile.js';

export default async function handler(request,response){
  if(request.method!=='GET')return response.status(405).end();
  const session=await readSession(request).catch(()=>null);if(!session?.sub)return response.status(401).end();
  const userId=Number(session.sub),position=Number(request.query?.position),slot=String(request.query?.slot||'');
  try{
    const sql=database();let rows;
    if(slot==='final')rows=await sql`SELECT hero_image_url AS image_url FROM profiles WHERE user_id=${userId} LIMIT 1`;
    else if(Number.isInteger(position)&&position>=1&&position<=10)rows=await sql`SELECT image_url FROM gallery_images WHERE user_id=${userId} AND position=${position} LIMIT 1`;
    else return response.status(400).end();
    const imageUrl=rows[0]?.image_url;if(!imageUrl)return response.status(404).end();
    if(!imageUrl.includes('.private.blob.vercel-storage.com'))return response.redirect(307,imageUrl);
    const result=await get(imageUrl,privateBlobOptions({access:'private',ifNoneMatch:request.headers['if-none-match']}));
    if(!result)return response.status(404).end();
    response.setHeader('Cache-Control','private, no-cache');response.setHeader('ETag',result.blob.etag);
    if(result.statusCode===304)return response.status(304).end();
    response.setHeader('Content-Type',result.blob.contentType);response.setHeader('X-Content-Type-Options','nosniff');
    return Readable.fromWeb(result.stream).pipe(response);
  }catch(error){console.error(error);return response.status(404).end()}
}
