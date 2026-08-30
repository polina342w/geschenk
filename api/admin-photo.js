import {get} from '@vercel/blob';
import {Readable} from 'node:stream';
import {readAdminSession} from './_admin.js';
import {privateBlobOptions} from './_blob.js';

export default async function handler(request,response){
  if(request.method!=='GET')return response.status(405).end();
  if(!await readAdminSession(request))return response.status(401).end();
  const pathname=String(request.query?.pathname||'');
  if(!pathname||pathname.includes('..'))return response.status(400).end();
  try{
    const result=await get(pathname,privateBlobOptions({access:'private',ifNoneMatch:request.headers['if-none-match']}));
    if(!result)return response.status(404).end();
    response.setHeader('Cache-Control','private, no-cache');response.setHeader('ETag',result.blob.etag);
    if(result.statusCode===304)return response.status(304).end();
    response.setHeader('Content-Type',result.blob.contentType);response.setHeader('X-Content-Type-Options','nosniff');
    return Readable.fromWeb(result.stream).pipe(response);
  }catch(error){console.error(error);return response.status(404).end()}
}
