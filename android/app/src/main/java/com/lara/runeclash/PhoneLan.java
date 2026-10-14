package com.lara.runeclash;

import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import org.json.JSONObject;
import java.io.*;
import java.math.BigInteger;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.cert.X509Certificate;
import java.util.*;
import java.util.concurrent.*;
import javax.net.ssl.*;
import javax.security.auth.x500.X500Principal;

/** TLS host on the phone. Pairing pins the exact certificate from the private room invitation.
 * Never disables TLS validation globally and never downloads executable web content from peers. */
final class PhoneLan implements AutoCloseable {
 interface Dispatch { String call(String json) throws Exception; }
 private SSLServerSocket server;
 private final ThreadPoolExecutor pool=new ThreadPoolExecutor(2,8,30,TimeUnit.SECONDS,new ArrayBlockingQueue<>(24));
 private final Dispatch dispatch;
 private final String roomSecret;
 final String fingerprint;
 final int port;
 private volatile boolean closed;
 private final Map<String,long[]> rates=new HashMap<>();

 PhoneLan(Context context,Dispatch dispatch) throws Exception {
  this.dispatch=dispatch;roomSecret=random();
  KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);
  String alias="rune-clash-lan-v8";
  if(!ks.containsAlias(alias)){
   KeyPairGenerator generator=KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_RSA,"AndroidKeyStore");
   generator.initialize(new KeyGenParameterSpec.Builder(alias,KeyProperties.PURPOSE_SIGN|KeyProperties.PURPOSE_VERIFY|KeyProperties.PURPOSE_DECRYPT)
    .setKeySize(2048).setDigests(KeyProperties.DIGEST_SHA256,KeyProperties.DIGEST_SHA384,KeyProperties.DIGEST_SHA512)
    .setSignaturePaddings(KeyProperties.SIGNATURE_PADDING_RSA_PKCS1,KeyProperties.SIGNATURE_PADDING_RSA_PSS)
    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_RSA_PKCS1)
    .setCertificateSubject(new X500Principal("CN=Clash Lara Phone Host"))
    .setCertificateSerialNumber(BigInteger.valueOf(System.currentTimeMillis()))
    .setCertificateNotBefore(new Date(System.currentTimeMillis()-86400000L))
    .setCertificateNotAfter(new Date(System.currentTimeMillis()+10L*365*86400000L)).build());
   generator.generateKeyPair();
  }
  PrivateKey privateKey=(PrivateKey)ks.getKey(alias,null);
  X509Certificate cert=(X509Certificate)ks.getCertificate(alias);
  fingerprint=hex(MessageDigest.getInstance("SHA-256").digest(cert.getEncoded()));
  X509ExtendedKeyManager km=new X509ExtendedKeyManager(){
   public String[] getClientAliases(String k,Principal[] i){return null;}
   public String chooseClientAlias(String[] k,Principal[] i,Socket s){return null;}
   public String[] getServerAliases(String k,Principal[] i){return "RSA".equals(k)?new String[]{alias}:null;}
   public String chooseServerAlias(String k,Principal[] i,Socket s){return "RSA".equals(k)?alias:null;}
   public X509Certificate[] getCertificateChain(String a){return new X509Certificate[]{cert};}
   public PrivateKey getPrivateKey(String a){return privateKey;}
  };
  SSLContext tls=SSLContext.getInstance("TLSv1.2");tls.init(new KeyManager[]{km},null,new SecureRandom());
  server=(SSLServerSocket)tls.getServerSocketFactory().createServerSocket(0,16,InetAddress.getByName("0.0.0.0"));
  server.setEnabledProtocols(new String[]{"TLSv1.2"});port=server.getLocalPort();
  Thread listener=new Thread(()->{while(!closed){try{SSLSocket socket=(SSLSocket)server.accept();try{pool.execute(()->handle(socket));}catch(RejectedExecutionException busy){socket.close();}}catch(IOException e){if(closed)break;}}},"RuneLAN-listener");listener.setDaemon(true);listener.start();
 }
 static String random(){byte[] b=new byte[32];new SecureRandom().nextBytes(b);return Base64.getUrlEncoder().withoutPadding().encodeToString(b);}
 static String hex(byte[] b){StringBuilder s=new StringBuilder();for(byte x:b)s.append(String.format(Locale.ROOT,"%02x",x&255));return s.toString();}
 static boolean isPrivate(String host){try{if(!host.matches("[0-9]{1,3}(\\.[0-9]{1,3}){3}"))return false;String[] p=host.split("\\.");int[] n=new int[4];for(int i=0;i<4;i++){n[i]=Integer.parseInt(p[i]);if(n[i]>255)return false;}return n[0]==10||(n[0]==172&&n[1]>=16&&n[1]<=31)||(n[0]==192&&n[1]==168)||host.equals("127.0.0.1");}catch(Exception e){return false;}}
 List<String> invitations() throws Exception {List<String> out=new ArrayList<>();for(NetworkInterface ni:Collections.list(NetworkInterface.getNetworkInterfaces())){
  if(!ni.isUp()||ni.isLoopback())continue;
  for(InetAddress a:Collections.list(ni.getInetAddresses()))if(a instanceof Inet4Address&&isPrivate(a.getHostAddress()))out.add(invite(a.getHostAddress()));
 }return out;}
 String invite(String ip) throws Exception {JSONObject j=new JSONObject();j.put("ip",ip).put("port",port).put("pin",fingerprint).put("room",roomSecret);return "LARA8:"+Base64.getUrlEncoder().withoutPadding().encodeToString(j.toString().getBytes(StandardCharsets.UTF_8));}
 static JSONObject parse(String invite)throws Exception {if(!invite.startsWith("LARA8:")||invite.length()>1000)throw new IOException("Convite inválido");JSONObject j=new JSONObject(new String(Base64.getUrlDecoder().decode(invite.substring(6).trim()),StandardCharsets.UTF_8));if(!isPrivate(j.getString("ip"))||j.getInt("port")<1024||j.getInt("port")>65535||!j.getString("pin").matches("[a-f0-9]{64}")||!j.getString("room").matches("[A-Za-z0-9_-]{43}"))throw new IOException("O convite deve apontar para um IP privado do Wi-Fi");return j;}
 private synchronized boolean rate(String ip){long now=android.os.SystemClock.elapsedRealtime();long[] v=rates.get(ip);if(v==null||now-v[0]>1000){v=new long[]{now,0};rates.put(ip,v);}if(rates.size()>256)rates.entrySet().removeIf(e->now-e.getValue()[0]>60000);return ++v[1]<=30;}
 private static String line(InputStream in,int max)throws IOException {ByteArrayOutputStream b=new ByteArrayOutputStream();for(int i=0;i<max;i++){int v=in.read();if(v<0)throw new EOFException();if(v=='\n')return b.toString("US-ASCII").replace("\r","");b.write(v);}throw new IOException("Header too large");}
 private void handle(SSLSocket s){try(s){s.setSoTimeout(5000);String ip=s.getInetAddress().getHostAddress();if(!isPrivate(ip)||!rate(ip))return;s.startHandshake();InputStream in=new BufferedInputStream(s.getInputStream());String request=line(in,1024);if(!request.equals("POST /rpc HTTP/1.1"))return;Map<String,String> headers=new HashMap<>();int total=0;while(true){String l=line(in,2048);total+=l.length();if(total>8192)return;if(l.isEmpty())break;int at=l.indexOf(':');if(at>0)headers.put(l.substring(0,at).toLowerCase(Locale.ROOT),l.substring(at+1).trim());}
  String secret=headers.getOrDefault("x-room","");if(!MessageDigest.isEqual(secret.getBytes(StandardCharsets.UTF_8),roomSecret.getBytes(StandardCharsets.UTF_8)))return;
  if(headers.containsKey("transfer-encoding"))return;
  int len=Integer.parseInt(headers.getOrDefault("content-length","0"));if(len<2||len>196608)return;byte[] bytes=new byte[len];new DataInputStream(in).readFully(bytes);
  JSONObject payload=new JSONObject(new String(bytes,StandardCharsets.UTF_8));payload.put("owner",false);String key=headers.getOrDefault("x-device","");if(!key.matches("[A-Za-z0-9_-]{32,128}"))return;payload.put("key",key);
  String result=dispatch.call(payload.toString());byte[] body=result.getBytes(StandardCharsets.UTF_8);OutputStream out=s.getOutputStream();out.write(("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: "+body.length+"\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n").getBytes(StandardCharsets.US_ASCII));out.write(body);out.flush();
 }catch(Exception ignored){/* A malformed or expired connection is dropped without changing world state. */}}
 static String request(JSONObject room,String device,String json)throws Exception{
  String host=room.getString("ip"),pin=room.getString("pin");if(!isPrivate(host))throw new IOException("Rede privada necessária");
  X509TrustManager trust=new X509TrustManager(){public X509Certificate[] getAcceptedIssuers(){return new X509Certificate[0];}public void checkClientTrusted(X509Certificate[] c,String a)throws java.security.cert.CertificateException{throw new java.security.cert.CertificateException("Client certificates not used");}public void checkServerTrusted(X509Certificate[] c,String a)throws java.security.cert.CertificateException{try{if(c.length==0||!MessageDigest.isEqual(pin.getBytes(StandardCharsets.US_ASCII),hex(MessageDigest.getInstance("SHA-256").digest(c[0].getEncoded())).getBytes(StandardCharsets.US_ASCII)))throw new java.security.cert.CertificateException("Certificado não corresponde ao convite");c[0].checkValidity();}catch(GeneralSecurityException e){throw new java.security.cert.CertificateException(e);}}};
  SSLContext tls=SSLContext.getInstance("TLSv1.2");tls.init(null,new TrustManager[]{trust},new SecureRandom());
  // Certificate identity is the exact SHA-256 pin exchanged in the invitation, independent of DHCP IP.
  HttpsURLConnection conn=(HttpsURLConnection)new URL("https://"+host+":"+room.getInt("port")+"/rpc").openConnection(java.net.Proxy.NO_PROXY);
  conn.setSSLSocketFactory(tls.getSocketFactory());conn.setHostnameVerifier((hostname,session)->{try{return hostname.equals(host)&&MessageDigest.isEqual(pin.getBytes(StandardCharsets.US_ASCII),hex(MessageDigest.getInstance("SHA-256").digest(session.getPeerCertificates()[0].getEncoded())).getBytes(StandardCharsets.US_ASCII));}catch(Exception e){return false;}});
  conn.setInstanceFollowRedirects(false);conn.setConnectTimeout(5000);conn.setReadTimeout(8000);conn.setRequestMethod("POST");conn.setDoOutput(true);conn.setRequestProperty("Content-Type","application/json");conn.setRequestProperty("X-Room",room.getString("room"));conn.setRequestProperty("X-Device",device);byte[] body=json.getBytes(StandardCharsets.UTF_8);conn.setFixedLengthStreamingMode(body.length);try{try(OutputStream out=conn.getOutputStream()){out.write(body);}if(conn.getResponseCode()!=200)throw new IOException("Conexão recusada");try(InputStream in=conn.getInputStream();ByteArrayOutputStream out=new ByteArrayOutputStream()){byte[] buf=new byte[4096];int n;while((n=in.read(buf))!=-1){if(out.size()+n>524288)throw new IOException("Resposta excessiva");out.write(buf,0,n);}return out.toString("UTF-8");}}finally{conn.disconnect();}
 }
 public void close(){closed=true;try{server.close();}catch(Exception ignored){}pool.shutdownNow();}
}
