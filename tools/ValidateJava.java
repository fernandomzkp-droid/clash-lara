import javax.tools.*;
import com.sun.source.util.JavacTask;
import java.util.*;
class ValidateJava {
 public static void main(String[] args)throws Exception {
  JavaCompiler compiler=ToolProvider.getSystemJavaCompiler();
  DiagnosticCollector<JavaFileObject> diagnostics=new DiagnosticCollector<>();
  try(StandardJavaFileManager files=compiler.getStandardFileManager(diagnostics,null,null)) {
   JavacTask task=(JavacTask)compiler.getTask(null,files,diagnostics,List.of("-proc:none"),null,files.getJavaFileObjects(args));
   task.parse();
   for(var d:diagnostics.getDiagnostics())if(d.getKind()==Diagnostic.Kind.ERROR){System.err.println(d);System.exit(1);}
   System.out.println("Java syntax parsed. Android type checking and APK build still require the Android SDK.");
  }
 }
}
