"use strict";(()=>{var e={};e.id=545,e.ids=[545],e.modules={5890:e=>{e.exports=require("better-sqlite3")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4770:e=>{e.exports=require("crypto")},2048:e=>{e.exports=require("fs")},5315:e=>{e.exports=require("path")},5184:(e,r,s)=>{s.r(r),s.d(r,{originalPathname:()=>c,patchFetch:()=>h,requestAsyncStorage:()=>E,routeModule:()=>u,serverHooks:()=>C,staticGenerationAsyncStorage:()=>d});var t={};s.r(t),s.d(t,{PUT:()=>p});var n=s(9303),o=s(8716),a=s(670),l=s(7070),i=s(5748);async function p(e,{params:r}){try{let s=parseInt(r.id,10),{name:t,address:n,phone:o,whatsapp:a,opening_hours:p,closing_hours:u,active:E,is_delivery:d,lat:C,lng:c,allows_delivery:h,allows_pickup:S,allows_reservation:A,allows_dine_in:_,whatsapp_number:O,whatsapp_message:g}=await e.json();if(!i.Z.prepare("SELECT * FROM stores WHERE id = ?").get(s))return l.NextResponse.json({error:"Store not found"},{status:404});i.Z.prepare(`UPDATE stores SET
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        phone = COALESCE(?, phone),
        whatsapp = COALESCE(?, whatsapp),
        opening_hours = COALESCE(?, opening_hours),
        closing_hours = COALESCE(?, closing_hours),
        active = COALESCE(?, active),
        is_delivery = COALESCE(?, is_delivery),
        lat = COALESCE(?, lat),
        lng = COALESCE(?, lng),
        allows_delivery = COALESCE(?, allows_delivery),
        allows_pickup = COALESCE(?, allows_pickup),
        allows_reservation = COALESCE(?, allows_reservation),
        allows_dine_in = COALESCE(?, allows_dine_in),
        whatsapp_number = COALESCE(?, whatsapp_number),
        whatsapp_message = COALESCE(?, whatsapp_message)
       WHERE id = ?`).run(t??null,n??null,o??null,a??null,p??null,u??null,E??null,d??null,C??null,c??null,h??null,S??null,A??null,_??null,O??null,g??null,s);let v=i.Z.prepare("SELECT * FROM stores WHERE id = ?").get(s);return l.NextResponse.json(v)}catch(e){return console.error("Error updating store:",e),l.NextResponse.json({error:"Internal server error"},{status:500})}}let u=new n.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/stores/[id]/route",pathname:"/api/stores/[id]",filename:"route",bundlePath:"app/api/stores/[id]/route"},resolvedPagePath:"/home/user/Claude/cia-da-pizza/src/app/api/stores/[id]/route.ts",nextConfigOutput:"",userland:t}),{requestAsyncStorage:E,staticGenerationAsyncStorage:d,serverHooks:C}=u,c="/api/stores/[id]/route";function h(){return(0,a.patchFetch)({serverHooks:C,staticGenerationAsyncStorage:d})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var s=e=>r(r.s=e),t=r.X(0,[276,972,691,748],()=>s(5184));module.exports=t})();