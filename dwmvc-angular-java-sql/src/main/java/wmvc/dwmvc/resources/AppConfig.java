package wmvc.dwmvc.resources;

import java.util.HashSet;
import java.util.Set;
import javax.ws.rs.core.Application;
import org.glassfish.jersey.media.sse.SseFeature;

@javax.ws.rs.ApplicationPath("/svc")
public class AppConfig extends Application 
{
    @Override
    public Set<Class<?>> getClasses() 
    {
        Set<Class<?>> classes = new HashSet<>();
        classes.add(BlogApp.class);        
        return classes;
    }

    @Override
    public Set<Object> getSingletons() 
    {
        Set<Object> singletons = new HashSet<>();
        singletons.add(new SseFeature());
        return singletons; 
    }      
}
