import {clearAdminCookie} from './_admin.js';
export default function handler(request,response){if(request.method!=='POST')return response.status(405).json({error:'Methode nicht erlaubt.'});response.setHeader('Set-Cookie',clearAdminCookie());return response.status(200).json({ok:true})}
