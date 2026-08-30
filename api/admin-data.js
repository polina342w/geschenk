import {list} from '@vercel/blob';
import {readAdminSession} from './_admin.js';
import {privateBlobOptions} from './_blob.js';
import {database} from './_profile.js';

export default async function handler(request,response){
  if(request.method!=='GET')return response.status(405).json({error:'Methode nicht erlaubt.'});
  if(!await readAdminSession(request))return response.status(401).json({error:'Admin-Anmeldung erforderlich.'});
  try{
    const sql=database();
    const users=await sql`SELECT id,username,COALESCE(display_name,username) AS display_name FROM users ORDER BY id ASC`;
    const userId=Number(request.query?.userId||users[0]?.id);
    const user=users.find(item=>Number(item.id)===userId);
    if(!user)return response.status(400).json({error:'Profil nicht gefunden.'});
    const [blobResult,gallery,profiles]=await Promise.all([
      list(privateBlobOptions({limit:100})),
      sql`SELECT position,image_url,alt_text,caption,note FROM gallery_images WHERE user_id=${userId} ORDER BY position ASC`,
      sql`SELECT hero_image_url FROM profiles WHERE user_id=${userId} LIMIT 1`
    ]);
    const blobs=blobResult.blobs.filter(blob=>/\.(jpe?g|png|webp|avif|heic)$/i.test(blob.pathname)).map(blob=>({pathname:blob.pathname,url:blob.url,size:blob.size,uploadedAt:blob.uploadedAt}));
    return response.status(200).json({users,user,blobs,gallery,hero_image_url:profiles[0]?.hero_image_url||''});
  }catch(error){console.error(error);return response.status(500).json({error:'Blob und Neon konnten nicht gelesen werden. Prüfe die Store-Verbindung.'})}
}
