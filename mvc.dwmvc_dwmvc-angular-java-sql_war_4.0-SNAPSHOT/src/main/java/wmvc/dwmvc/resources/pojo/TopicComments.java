package wmvc.dwmvc.resources.pojo;

import wmvc.dwmvc.resources.ConfigStringConstants;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class TopicComments implements Serializable
{
    private static final String DEFAULT_DESCRIPTION = "WMVC Real Time Fulfillment";
    
    private Integer topicId;
    private String description;
    private Date lastUpdatedDate = new Date();
    private List<String> comments = new ArrayList<>();

    public Integer getTopicId() 
    {
        if(this.topicId == null)
        {
            return ConfigStringConstants.TOPIC_ID; 
        }
        return this.topicId;
    }

    public void setTopicId(Integer topicId) 
    {
        this.topicId = topicId;
    }

    public String getDescription() 
    {
        if(this.description == null)
        {
            return DEFAULT_DESCRIPTION;
        }
        return this.description;
    }

    public void setDescription(String description) 
    {
        this.description = description;
    }

    public Date getLastUpdatedDate() 
    {
        return this.lastUpdatedDate;
    }

    public void setLastUpdatedDate(Date lastUpdatedDate) 
    {
        this.lastUpdatedDate = lastUpdatedDate;
    }

    public List<String> getComments() 
    {
        return comments;
    }

    public void setComments(List<String> comments) 
    {
        this.comments = comments;
    }
    
    public void addComment(String newComment)
    {
        this.comments.add(newComment);
    }    
}
