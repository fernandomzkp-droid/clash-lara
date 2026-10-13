package com.lara.runeclash;

import android.app.*;
import android.content.*;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.*;
import android.webkit.*;
import android.widget.*;
import org.json.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

/** The app always displays its own bundled game at one origin: offline and LAN share the same save.
 * Remote peers can only exchange bounded JSON through a certificate-pinned native TLS client. */
public final class MainActivity extends Activity {
 private WebView web,engine;
 private PhoneLan host;
 private PhoneBluetooth bluetooth;
 private boolean bluetoothMode=false,bluetoothHost=false;
 private Runnable afterPermission;
 private JSONObject room;
 private final ExecutorService worker=Executors.newSingleThreadExecutor();
 private volatile boolean ready=false,joined=false;
 private String deviceKey;
 private Button roomButton;
 private final String ORIGIN="https://offline.runeclash.local/";
 @Override public void onCreate(Bundle state){super.onCreate(state);
  deviceKey=getPreferences(0).getString("device_key",null);if(deviceKey==null){deviceKey=PhoneLan.random();getPreferences(0).edit().putString("device_key",deviceKey).apply();}
  getWindow().setStatusBarColor(Color.rgb(7,13,29));getWindow().setNavigationBarColor(Color.rgb(7,13,29));
  LinearLayout root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setBackgroundColor(Color.rgb(7,13,29));
  LinearLayout bar=new LinearLayout(this);Button solo=button("SOLO"),create=button("CRIAR SALA"),join=button("ENTRAR");roomButton=button("CONVITE");
  for(Button b:new Button[]{solo,create,join,roomButton})bar.addView(b,new LinearLayout.LayoutParams(0,dp(48),1));root.addView(bar);
  web=new WebView(this);configure(web);web.getSettings().setDomStorageEnabled(true);web.addJavascriptInterface(new NativeBridge(),"NativeLan");
  web.setWebChromeClient(new WebChromeClient());
  web.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest req){if(!req.getUrl().toString().equals(ORIGIN))return new WebResourceResponse("text/plain","UTF-8",new ByteArrayInputStream(new byte[0]));try{return new WebResourceResponse("text/html","UTF-8",getAssets().open("game.html"));}catch(IOException e){return null;}}
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req){return true;}
   @Override public void onReceivedSslError(WebView v,SslErrorHandler handler,android.net.http.SslError e){handler.cancel();}
  });
  root.addView(web,new LinearLayout.LayoutParams(-1,0,1));setContentView(root);
  if(android.os.Build.VERSION.SDK_INT>=35)root.setOnApplyWindowInsetsListener((v,insets)->{android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout());v.setPadding(bars.left,bars.top,bars.right,bars.bottom);return insets;});
  solo.setOnClickListener(v->leave());create.setOnClickListener(v->chooseTransport(true));join.setOnClickListener(v->chooseTransport(false));roomButton.setOnClickListener(v->showInvite());web.loadUrl(ORIGIN);
 }
 private void configure(WebView w){WebSettings s=w.getSettings();s.setJavaScriptEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setJavaScriptCanOpenWindowsAutomatically(false);w.setBackgroundColor(Color.rgb(7,13,29));}
 private Button button(String name){Button b=new Button(this);b.setText(name);b.setTextSize(9);b.setTextColor(Color.rgb(255,226,174));b.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(25,42,66)));return b;}
 private int dp(int n){return Math.round(n*getResources().getDisplayMetrics().density);}
 private void message(String s){runOnUiThread(()->new AlertDialog.Builder(this).setTitle("Clash Lara · Amigos").setMessage(s).setPositiveButton("OK",null).show());}
 private void nameThen(Runnable next){EditText input=new EditText(this);input.setSingleLine(true);input.setText(getPreferences(0).getString("hero_name","Aventureiro"));new AlertDialog.Builder(this).setTitle("Nome do seu personagem").setView(input).setPositiveButton("CONTINUAR",(d,w)->{String n=input.getText().toString().trim();getPreferences(0).edit().putString("hero_name",n.isEmpty()?"Aventureiro":n.substring(0,Math.min(24,n.length()))).apply();next.run();}).setNegativeButton("CANCELAR",null).show();}
 private android.bluetooth.BluetoothAdapter bluetoothAdapter(){android.bluetooth.BluetoothManager manager=(android.bluetooth.BluetoothManager)getSystemService(BLUETOOTH_SERVICE);return manager==null?null:manager.getAdapter();}
 private void chooseTransport(boolean hosting){if(joined||host!=null||bluetoothHost){message("Volte ao SOLO antes de trocar de sala.");return;}new AlertDialog.Builder(this).setTitle(hosting?"Hospedar meu mundo":"Entrar no mundo de um amigo").setItems(new String[]{"Bluetooth · celulares pareados","Wi-Fi / hotspot · convite"},(d,w)->{bluetoothMode=w==0;if(bluetoothMode)permissionThen(()->{if(hosting)create();else joinBluetooth();});else if(hosting)create();else askJoin();}).show();}
 private void permissionThen(Runnable next){if(android.os.Build.VERSION.SDK_INT>=31&&(checkSelfPermission(android.Manifest.permission.BLUETOOTH_CONNECT)!=android.content.pm.PackageManager.PERMISSION_GRANTED||checkSelfPermission(android.Manifest.permission.BLUETOOTH_ADVERTISE)!=android.content.pm.PackageManager.PERMISSION_GRANTED)){afterPermission=next;requestPermissions(new String[]{android.Manifest.permission.BLUETOOTH_CONNECT,android.Manifest.permission.BLUETOOTH_ADVERTISE},42);return;}android.bluetooth.BluetoothAdapter a=bluetoothAdapter();if(a==null){message("Este aparelho não oferece Bluetooth Classic.");return;}if(!a.isEnabled()){startActivity(new Intent(android.bluetooth.BluetoothAdapter.ACTION_REQUEST_ENABLE));message("Ative o Bluetooth e toque novamente no botão da sala.");return;}next.run();}
 @Override public void onRequestPermissionsResult(int code,String[] names,int[] results){super.onRequestPermissionsResult(code,names,results);if(code==42){Runnable next=afterPermission;afterPermission=null;if(results.length==2&&results[0]==0&&results[1]==0&&next!=null)permissionThen(next);else message("O Android exige permissão de dispositivos próximos para jogar por Bluetooth.");}}
 private void joinBluetooth(){try{java.util.List<android.bluetooth.BluetoothDevice> devices=new java.util.ArrayList<>(bluetoothAdapter().getBondedDevices());if(devices.isEmpty()){new AlertDialog.Builder(this).setTitle("Parear com o anfitrião").setMessage("Primeiro pareie os dois celulares nas configurações de Bluetooth. O amigo precisa tocar em CRIAR SALA → Bluetooth.").setPositiveButton("ABRIR BLUETOOTH",(d,w)->startActivity(new Intent(android.provider.Settings.ACTION_BLUETOOTH_SETTINGS))).setNegativeButton("VOLTAR",null).show();return;}String[] labels=new String[devices.size()];for(int i=0;i<labels.length;i++)labels[i]=(devices.get(i).getName()==null?"Celular":devices.get(i).getName())+" · "+devices.get(i).getAddress();new AlertDialog.Builder(this).setTitle("Celular que está hospedando").setItems(labels,(d,w)->nameThen(()->{Toast.makeText(this,"Conectando por Bluetooth…",Toast.LENGTH_LONG).show();bluetooth=new PhoneBluetooth(bluetoothAdapter());worker.execute(()->{try{bluetooth.connect(devices.get(w));runOnUiThread(this::startConnection);}catch(Exception e){bluetooth.close();bluetooth=null;message("Não conectou. Confira o pareamento e se o amigo criou a sala Bluetooth.");}});})).setNeutralButton("PAREAR OUTRO",(d,w)->startActivity(new Intent(android.provider.Settings.ACTION_BLUETOOTH_SETTINGS))).show();}catch(SecurityException e){message("Permita dispositivos próximos nas configurações do aplicativo.");}}
 private void create(){if(host!=null){showInvite();return;}if(joined){message("Volte ao SOLO antes de criar outra sala.");return;}nameThen(()->{
  Toast.makeText(this,"Preparando seu mundo…",Toast.LENGTH_SHORT).show();
  engine=new WebView(this);configure(engine);engine.setWebViewClient(new WebViewClient(){@Override public void onPageFinished(WebView view,String url){if(ready)return;ready=true;worker.execute(()->{try{if(bluetoothMode){bluetooth=new PhoneBluetooth(bluetoothAdapter());bluetooth.host(MainActivity.this::dispatch);bluetoothHost=true;}else{host=new PhoneLan(MainActivity.this,MainActivity.this::dispatch);room=PhoneLan.parse(host.invite("127.0.0.1"));}runOnUiThread(()->{getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);startConnection();showInvite();});}catch(Exception e){ready=false;message("Não foi possível abrir a sala: "+e.getMessage());}});}});
  try(InputStream in=getAssets().open("host.html")){ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[4096];int n;while((n=in.read(b))>0)out.write(b,0,n);engine.loadDataWithBaseURL("https://engine.runeclash.local/",out.toString("UTF-8"),"text/html","UTF-8",null);}catch(Exception e){message(e.getMessage());}
 });}
 private String dispatch(String request)throws Exception{CountDownLatch latch=new CountDownLatch(1);String[] value={"{\"ok\":false,\"error\":\"HOST_INDISPONIVEL\"}"};runOnUiThread(()->{if(engine==null){latch.countDown();return;}engine.evaluateJavascript("JSON.stringify(phoneRealm.execute("+request+"))",result->{try{Object parsed=new JSONTokener(result).nextValue();if(parsed instanceof String)value[0]=(String)parsed;}catch(Exception ignored){}latch.countDown();});});if(!latch.await(6,TimeUnit.SECONDS))throw new IOException("O anfitrião não respondeu");return value[0];}
 private void startConnection(){joined=true;web.evaluateJavascript("window.dispatchEvent(new Event('rune-native-connect'))",null);}
 private void askJoin(){if(host!=null||joined){message("Volte ao SOLO antes de entrar em outra sala.");return;}EditText input=new EditText(this);input.setMinLines(3);input.setHint("Cole aqui o convite LARA8:… do anfitrião");new AlertDialog.Builder(this).setTitle("Entrar pelo mesmo Wi-Fi").setMessage("Conecte os celulares ao mesmo Wi-Fi ou ao hotspot do anfitrião. Cole o convite que ele compartilhou.").setView(input).setPositiveButton("ENTRAR",(d,w)->{try{String text=input.getText().toString().trim();int at=text.indexOf("LARA8:");if(at>=0)text=text.substring(at).split("\\s")[0];room=PhoneLan.parse(text);nameThen(this::startConnection);}catch(Exception e){message("Convite inválido. Copie o código completo do anfitrião.");}}).setNegativeButton("CANCELAR",null).show();}
 private void showInvite(){if(bluetoothHost){new AlertDialog.Builder(this).setTitle("Seu mundo está aberto por Bluetooth").setMessage("Pareie os celulares. No amigo: ENTRAR → Bluetooth → escolha este celular. Até 4 convidados. Mantenha o jogo aberto.").setPositiveButton("FICAR VISÍVEL",(d,w)->{Intent i=new Intent(android.bluetooth.BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);i.putExtra(android.bluetooth.BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION,300);startActivity(i);}).setNeutralButton("PAREAMENTO",(d,w)->startActivity(new Intent(android.provider.Settings.ACTION_BLUETOOTH_SETTINGS))).setNegativeButton("OK",null).show();return;}if(host==null){message(joined?"Peça o convite ao anfitrião da sala.":"Primeiro ative o hotspot ou conecte-se ao Wi-Fi e toque em CRIAR SALA.");return;}try{List<String> invitations=host.invitations();if(invitations.isEmpty()){message("Nenhum endereço Wi-Fi encontrado. Ative o roteador Wi-Fi do celular ou conecte-se ao Wi-Fi e tente CONVITE novamente.");return;}String[] labels=new String[invitations.size()];for(int i=0;i<labels.length;i++)labels[i]="Rede "+PhoneLan.parse(invitations.get(i)).getString("ip");if(labels.length==1){shareDialog(invitations.get(0));return;}new AlertDialog.Builder(this).setTitle("Escolha a rede do Wi-Fi/hotspot").setItems(labels,(d,w)->shareDialog(invitations.get(w))).show();}catch(Exception e){message(e.getMessage());}}
 private void shareDialog(String code){TextView t=new TextView(this);t.setPadding(dp(18),dp(12),dp(18),dp(12));t.setText("Sala aberta neste celular, para até 8 jogadores. Mantenha o jogo aberto e os celulares no mesmo Wi-Fi.\n\n"+code);t.setTextIsSelectable(true);new AlertDialog.Builder(this).setTitle("Convite da sua sala").setView(t).setPositiveButton("COPIAR",(d,w)->{android.content.ClipboardManager c=(android.content.ClipboardManager)getSystemService(CLIPBOARD_SERVICE);c.setPrimaryClip(ClipData.newPlainText("Convite Clash Lara",code));Toast.makeText(this,"Convite copiado",Toast.LENGTH_SHORT).show();}).setNeutralButton("COMPARTILHAR",(d,w)->{Intent i=new Intent(Intent.ACTION_SEND);i.setType("text/plain");i.putExtra(Intent.EXTRA_TEXT,"Entre no mesmo Wi-Fi/hotspot e cole este convite em ENTRAR no Clash Lara:\n"+code);startActivity(Intent.createChooser(i,"Compartilhar convite"));}).setNegativeButton("FECHAR",null).show();}
 private void leave(){if(!joined&&host==null&&!bluetoothHost)return;String msg=(host!=null||bluetoothHost)?"Encerrar sua sala desconecta os amigos. Os personagens já sincronizados ficam salvos em cada celular.":"Salvar o personagem e voltar ao modo offline?";new AlertDialog.Builder(this).setTitle("Voltar ao solo").setMessage(msg).setPositiveButton("SALVAR E SAIR",(d,w)->web.evaluateJavascript("window.dispatchEvent(new Event('rune-native-leave'))",null)).setNegativeButton("CANCELAR",null).show();}
 public final class NativeBridge {
  @JavascriptInterface public String name(){return getPreferences(0).getString("hero_name","Aventureiro");}
  @JavascriptInterface public boolean active(){return joined;}
  @JavascriptInterface public void menu(){runOnUiThread(()->new AlertDialog.Builder(MainActivity.this).setTitle("Jogar com amigos").setItems(new String[]{"Criar sala neste celular","Entrar na sala de um amigo"},(d,w)->{chooseTransport(w==0);}).show());}
  @JavascriptInterface public void send(String id,String payload){if(id==null||!id.matches("[0-9]{1,10}")||payload==null||payload.length()>196608)return;worker.execute(()->{String result;try{if(room==null&&bluetooth==null)throw new IOException("Crie uma sala ou entre pelo convite");JSONObject req=new JSONObject(payload);if(host!=null||bluetoothHost){req.put("key",deviceKey);req.put("owner",true);result=dispatch(req.toString());}else if(bluetoothMode)result=bluetooth.request(deviceKey,req.toString());else result=PhoneLan.request(room,deviceKey,req.toString());}catch(Exception e){result="{\"ok\":false,\"error\":\"Sem conexão. Confira Wi-Fi ou Bluetooth e se o anfitrião mantém o jogo aberto.\"}";}String json=result;runOnUiThread(()->{if(web!=null)web.evaluateJavascript("window.runeNativeReply&&window.runeNativeReply("+id+","+JSONObject.quote(json)+")",null);});});}
  @JavascriptInterface public void finishLeave(){runOnUiThread(()->{joined=false;room=null;ready=false;bluetoothHost=false;if(bluetooth!=null){bluetooth.close();bluetooth=null;}if(host!=null){host.close();host=null;}if(engine!=null){engine.destroy();engine=null;}getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);Toast.makeText(MainActivity.this,"Personagem salvo · modo offline",Toast.LENGTH_SHORT).show();});}
 }
 @Override public void onBackPressed(){if(joined||host!=null||bluetoothHost){leave();return;}super.onBackPressed();}
 @Override protected void onDestroy(){if(host!=null)host.close();if(bluetooth!=null)bluetooth.close();worker.shutdownNow();if(engine!=null)engine.destroy();if(web!=null)web.destroy();super.onDestroy();}
}
