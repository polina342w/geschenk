import {list} from '@vercel/blob';
import {readAdminSession} from './_admin.js';
import {privateBlobOptions} from './_blob.js';
import {database} from './_profile.js';

const clean=(value,max=500)=>String(value||'').trim().slice(0,max);
export default async function handler(request,response){
  if(request.method!=='POST')return response.status(405).json({error:'Methode nicht erlaubt.'});
  if(!await readAdminSession(request))return response.status(401).json({error:'Admin-Anmeldung erforderlich.'});
  const userId=Number(request.body?.userId),items=Array.isArray(request.body?.items)?request.body.items:[],finalPath=clean(request.body?.finalPath,500);
  if(!Number.isInteger(userId)||items.length>10)return response.status(400).json({error:'Ungültige Galerie.'});
  try{
    const sql=database();
    const users=await sql`SELECT id FROM users WHERE id=${userId} LIMIT 1`;
    if(!users[0])return response.status(404).json({error:'Profil nicht gefunden.'});
    const blobResult=await list(privateBlobOptions({limit:100}));
    const blobByPath=new Map(blobResult.blobs.map(blob=>[blob.pathname,blob.url]));
    const positions=new Set();
    for(const item of items){
      const position=Number(item.position),pathname=clean(item.pathname,500),imageUrl=blobByPath.get(pathname);
      if(!Number.isInteger(position)||position<1||position>10||positions.has(position)||!imageUrl)return response.status(400).json({error:'Position oder Bild ist ungültig.'});
      positions.add(position);
      const caption=clean(item.caption,160),note=clean(item.note,500),altText=clean(item.alt_text||caption,200);
      const updated=await sql`UPDATE gallery_images SET image_url=${imageUrl},alt_text=${altText},caption=${caption},note=${note} WHERE user_id=${userId} AND position=${position} RETURNING position`;
      if(!updated[0])await sql`INSERT INTO gallery_images (user_id,position,image_url,alt_text,caption,note) VALUES (${userId},${position},${imageUrl},${altText},${caption},${note})`;
    }
    if(finalPath){const finalUrl=blobByPath.get(finalPath);if(!finalUrl)return response.status(400).json({error:'Finales Foto wurde nicht gefunden.'});await sql`UPDATE profiles SET hero_image_url=${finalUrl} WHERE user_id=${userId}`}
    return response.status(200).json({ok:true,count:items.length});
  }catch(error){console.error(error);return response.status(500).json({error:'Galerie konnte nicht gespeichert werden.'})}
}
