package wmvc.dwmvc.resources;

import wmvc.dwmvc.resources.pojo.TopicComments;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.impossibl.postgres.api.jdbc.PGConnection;
import com.impossibl.postgres.api.jdbc.PGNotificationListener;
import java.io.IOException;
import java.sql.Statement;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.OutboundEvent;
import org.glassfish.jersey.media.sse.SseFeature;
import org.json.JSONObject;

@Path("/comments")
public class BlogApp 
{
    
    private static final String NO_COMMENTS = "{\"comments\":[]}";
    
    @GET
    @Path("/all")
    @Produces(SseFeature.SERVER_SENT_EVENTS)
    public EventOutput getAllComments() throws Exception
    {
        final EventOutput eventOutput = new EventOutput();
        Statement sqlStatement =  null;
        
	try 
        {   
            //Query and return current data
            String comments = BlogByPostgreSQL.getInstance().findComments(ConfigStringConstants.TOPIC_ID);       
            this.writeToEventOutput(comments, eventOutput); 
            
            //Listen to future change notifications
            PGConnection conn = (PGConnection)BlogByPostgreSQL.getInstance().getConnection();
            sqlStatement = conn.createStatement();
            sqlStatement.execute("LISTEN topics_observer");             
            conn.addNotificationListener("topics_observer", new PGNotificationListener() 
            {
                @Override
                public void notification(int processId, String channelName, String payload) 
                {
                    JSONObject plJson = new JSONObject(payload);
                    String plComments = plJson.getJSONObject("topic_comments").toString();
                    writeToEventOutput(plComments, eventOutput);
                }
            });    
        } 
        catch (Exception e) 
        {
            throw new RuntimeException(
                "Error when writing the event.", e);
        } 
        finally 
        {
            try 
            {
               BlogByPostgreSQL.getInstance().closeSqlStatement(sqlStatement);
            } 
            catch (Exception ioClose) 
            {
               throw new RuntimeException(
                    "Error when closing the event output.", ioClose);
            }
        }        
	return eventOutput;
    }
      
    private void writeToEventOutput(String comments, EventOutput eventOutput)
    {
        OutboundEvent.Builder eventBuilder = new OutboundEvent.Builder();
        eventBuilder.mediaType(MediaType.APPLICATION_JSON_TYPE);
        
        if(comments == null || comments.trim().equals(""))
        {
            comments = NO_COMMENTS;
        }
        eventBuilder.data(String.class, comments);

        OutboundEvent event = eventBuilder.build();
        
        try
        {
            eventOutput.write(event); 
        }
        catch(IOException e)
        {
            throw new RuntimeException("Error in writing to event output", e);
        }
    }
    
    @POST
    @Path("/cast")
    @Consumes(MediaType.APPLICATION_JSON) 
    public void addComment(String newComment) throws Exception 
    {
        if(newComment != null && !newComment.trim().equals(""))
        {
            ObjectMapper mapper = new ObjectMapper();
            TopicComments topicComments;
            String comments = BlogByPostgreSQL.getInstance().findComments(ConfigStringConstants.TOPIC_ID);

            if(comments == null || comments.trim().equals(""))
            {
                topicComments = new TopicComments();
                topicComments.addComment(newComment);
                String topicCommentsStr = mapper.writeValueAsString(topicComments);
                BlogByPostgreSQL.getInstance().addTopic(topicCommentsStr);
            }
            else
            {     
                if(!comments.contains(newComment))
                {
                    topicComments = mapper.readValue(comments, TopicComments.class);
                    topicComments.addComment(newComment);
                    String topicCommentsStr = mapper.writeValueAsString(topicComments);
                    BlogByPostgreSQL.getInstance().updateTopic(topicCommentsStr);
                }
            }
        }
    }
}
