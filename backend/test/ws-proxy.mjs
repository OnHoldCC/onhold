import {createServer} from 'node:http';
import {once} from 'node:events';
import WebSocket,{WebSocketServer} from 'ws';
export async function wsProxy(rpcUrl,port,onCall=()=>{}){
 const clients=new Set(),upstreams=new Set(),methods={};
 const state={blocked:false,failRpc:false,pruneHistory:false,rejectedHistory:0,duplicateLogs:true,connections:0,methods};
 const server=createServer(async(req,res)=>{try{let body='';for await(const chunk of req)body+=chunk;const value=JSON.parse(body);onCall();for(const v of Array.isArray(value)?value:[value])methods[v.method]=(methods[v.method]||0)+1;res.setHeader('content-type','application/json');if(state.pruneHistory&&value.method==='eth_getCode'&&!['latest','pending'].includes(value.params[1])){state.rejectedHistory++;res.end(JSON.stringify({jsonrpc:'2.0',id:value.id,error:{code:-32603,message:'historical state is pruned'}}));return;}if(state.failRpc){res.end(JSON.stringify({jsonrpc:'2.0',id:value.id,error:{code:-32000,message:'test transport unavailable'}}));return;}const r=await fetch(rpcUrl,{method:'POST',body,headers:{'content-type':'application/json'}});res.end(await r.text());}catch{res.statusCode=502;res.end('{}');}});
 const wss=new WebSocketServer({noServer:true});
 server.on('upgrade',(request,socket,head)=>{if(state.blocked){socket.destroy();return;}wss.handleUpgrade(request,socket,head,client=>{
  state.connections++;clients.add(client);const upstream=new WebSocket(rpcUrl.replace(/^http/,'ws'));upstreams.add(upstream);const queued=[];
  client.on('message',data=>{if(upstream.readyState===WebSocket.OPEN)upstream.send(data.toString());else queued.push(data.toString());});
  upstream.on('open',()=>{for(const text of queued)upstream.send(text);});
  upstream.on('message',data=>{if(client.readyState!==WebSocket.OPEN)return;const text=data.toString();client.send(text);if(state.duplicateLogs&&JSON.parse(text).params?.result?.topics)client.send(text);});
  upstream.on('error',()=>client.terminate());upstream.on('close',()=>{upstreams.delete(upstream);client.close();});client.on('close',()=>{clients.delete(client);upstream.terminate();});
 });});
 server.listen(port,'127.0.0.1');await once(server,'listening');
 state.active=()=>clients.size;
 state.disconnect=()=>{for(const s of clients)s.terminate();for(const s of upstreams)s.terminate();};
 state.close=async()=>{state.disconnect();wss.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));};return state;
}
