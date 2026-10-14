package com.lara.runeclash;

import android.bluetooth.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import org.json.JSONObject;

/** Bluetooth Classic RFCOMM: Android pairing supplies authenticated, encrypted transport.
 * Framed JSON reuses the exact host-authoritative realm used by Wi-Fi. */
final class PhoneBluetooth implements AutoCloseable {
 static final UUID SERVICE=UUID.fromString("9d0d9f73-7aa6-447e-867c-922ca6111a08");
 private final BluetoothAdapter adapter;
 private BluetoothServerSocket listener;
 private BluetoothSocket client;
 private final Set<BluetoothSocket> peers=Collections.synchronizedSet(new HashSet<>());
 private final ExecutorService pool=Executors.newFixedThreadPool(4);
 private volatile boolean closed;
 private final ScheduledExecutorService timeouts=Executors.newSingleThreadScheduledExecutor();
 private ScheduledFuture<?> deadline(BluetoothSocket socket){return timeouts.schedule(()->{try{socket.close();}catch(IOException ignored){}},12,TimeUnit.SECONDS);}
 PhoneBluetooth(BluetoothAdapter adapter){this.adapter=adapter;}
 void host(PhoneLan.Dispatch dispatch)throws IOException {
  listener=adapter.listenUsingRfcommWithServiceRecord("Clash Lara",SERVICE);
  Thread t=new Thread(()->{while(!closed){try{BluetoothSocket s=listener.accept();if(peers.size()>=4){s.close();continue;}peers.add(s);pool.execute(()->serve(s,dispatch));}catch(IOException|RejectedExecutionException e){if(closed)break;}}},"RuneBluetooth-host");t.setDaemon(true);t.start();
 }
 private void serve(BluetoothSocket s,PhoneLan.Dispatch dispatch){try(s){DataInputStream in=new DataInputStream(s.getInputStream());DataOutputStream out=new DataOutputStream(s.getOutputStream());while(!closed){String text=read(in);JSONObject req=new JSONObject(text);req.put("owner",false);String key=req.optString("key");if(!key.matches("[A-Za-z0-9_-]{32,128}"))break;write(out,dispatch.call(req.toString()));}}catch(Exception ignored){}finally{peers.remove(s);}}
 synchronized void connect(BluetoothDevice device)throws IOException{if(client!=null)try{client.close();}catch(IOException ignored){}client=device.createRfcommSocketToServiceRecord(SERVICE);ScheduledFuture<?> timeout=deadline(client);try{client.connect();}finally{timeout.cancel(false);}}
 synchronized String request(String deviceKey,String json)throws Exception{if(client==null||!client.isConnected())throw new IOException("Bluetooth desconectado");JSONObject req=new JSONObject(json);req.put("key",deviceKey);ScheduledFuture<?> timeout=deadline(client);try{write(new DataOutputStream(client.getOutputStream()),req.toString());return read(new DataInputStream(client.getInputStream()));}finally{timeout.cancel(false);}}
 private static String read(DataInputStream in)throws IOException{int n=in.readInt();if(n<2||n>196608)throw new IOException("Mensagem inválida");byte[] b=new byte[n];in.readFully(b);return new String(b,StandardCharsets.UTF_8);}
 private static void write(DataOutputStream out,String json)throws IOException{byte[] b=json.getBytes(StandardCharsets.UTF_8);if(b.length>196608)throw new IOException("Mensagem excessiva");out.writeInt(b.length);out.write(b);out.flush();}
 public void close(){closed=true;try{if(listener!=null)listener.close();}catch(IOException ignored){}try{if(client!=null)client.close();}catch(IOException ignored){}synchronized(peers){for(BluetoothSocket s:peers)try{s.close();}catch(IOException ignored){}peers.clear();}pool.shutdownNow();timeouts.shutdownNow();}
}
