import {list} from '@vercel/blob';
import {readAdminSession} from './_admin.js';
import {privateBlobOptions} from './_blob.js';
import {database} from './_profile.js';

export default async function handler(request,response){
  if(request.method!=='POST')return response.status(405).json({error:'Methode nicht erlaubt.'});
  if(!await readAdminSession(request))return response.status(401).json({error:'Admin-Anmeldung erforderlich.'});
  const userId=Number(request.body?.userId),pathname=String(request.body?.pathname||'').trim().slice(0,500);
  if(!Number.isInteger(userId)||!pathname)return response.status(400).json({error:'Выбери фотографию.'});
  try{
    const blobResult=await list(privateBlobOptions({limit:100}));
    const blob=blobResult.blobs.find(item=>item.pathname===pathname);
    if(!blob)return response.status(404).json({error:'Фотография не найдена в Private Blob.'});
    const sql=database();
    const updated=await sql`UPDATE profiles SET hero_image_url=${blob.url} WHERE user_id=${userId} RETURNING user_id`;
    if(!updated[0])return response.status(404).json({error:'Профиль не найден в Neon.'});
    return response.status(200).json({ok:true,pathname});
  }catch(error){console.error(error);return response.status(500).json({error:'Не удалось сохранить финальную фотографию.'})}
}
