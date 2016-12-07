package wmvc.dwmvc.resources;

import com.impossibl.postgres.jdbc.PGConnectionPoolDataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

class BlogByPostgreSQL 
{    
    private static BlogByPostgreSQL instance;
    private static PGConnectionPoolDataSource dataSource;
    
    private BlogByPostgreSQL()
    {
        try
        {
            dataSource = new PGConnectionPoolDataSource();
            
            dataSource.setHost(ConfigStringConstants.DATABASE_HOST);
            dataSource.setPort(ConfigStringConstants.DATABASE_PORT);
            dataSource.setDatabase(ConfigStringConstants.DATABASE_NAME);
            dataSource.setUser(ConfigStringConstants.DATABASE_USER);
            dataSource.setPassword(ConfigStringConstants.DATABASE_PW);
            dataSource.setHousekeeper(false);
            dataSource.setNetworkTimeout(10000);
        }
        catch(Exception e)
        {
            e.printStackTrace();
        }
    }
    
    public static final BlogByPostgreSQL getInstance()
    {
        if(instance == null)
        {
            instance = new BlogByPostgreSQL();
        }
        return instance;
    }

    public void addTopic(String comments) 
    {
        String insertString = "INSERT INTO topics (comments, topic_id) "
                + "VALUES (?, ?)";
        
        Connection conn = null;
        PreparedStatement sqlStatement = null;
        
        try
        {
            conn = this.getConnection();
            sqlStatement = conn.prepareStatement(insertString);
            sqlStatement.setString(1, comments);
            sqlStatement.setInt(2, ConfigStringConstants.TOPIC_ID);
            
            sqlStatement.executeUpdate();
        }
        catch(Exception e)
        {
            e.printStackTrace();
        }
        finally
        {
            this.closeSqlStatement(sqlStatement);
            this.closeConnection(conn);
        }
    }
    
    public void updateTopic(String comments) 
    {
        String updateString = "UPDATE topics SET comments = ? " 
                + "WHERE topic_id = ?";
        
        Connection conn = null;
        PreparedStatement sqlStatement = null;
        
        try
        {
            conn = this.getConnection();
            sqlStatement = conn.prepareStatement(updateString);
            sqlStatement.setString(1, comments);
            sqlStatement.setInt(2, ConfigStringConstants.TOPIC_ID);
            
            sqlStatement.executeUpdate();
        }
        catch(Exception e)
        {
            e.printStackTrace();
        }
        finally
        {
            this.closeSqlStatement(sqlStatement);
            this.closeConnection(conn);
        }
    }

    public String findComments(int topicId) 
    {
        String returnedStr = "";
        
        String queryString = "SELECT comments FROM topics WHERE topic_id = ?";
        
        Connection conn = null;
        PreparedStatement sqlStatement = null;
        
        try
        {
            conn = this.getConnection();
            sqlStatement = conn.prepareStatement(queryString);
            sqlStatement.setInt(1, topicId);
            
            ResultSet rs = sqlStatement.executeQuery();
            
            while (rs.next()) 
            {
                returnedStr = rs.getString("comments");
            }
        }
        catch(Exception e)
        {
            e.printStackTrace();
        }
        finally
        {
            this.closeSqlStatement(sqlStatement);
            this.closeConnection(conn);
        }
        return returnedStr;
    }
    
    Connection getConnection()
    {
        Connection conn = null;
        
        try
        {
            conn = dataSource.getPooledConnection().getConnection();
        }
        catch(Exception e)
        {
            e.printStackTrace();
        }                
        return conn;
    }
    
    void closeConnection(Connection conn)
    {
        if(conn == null)
        {
            System.out.println("Connection was not open");
        }
        else
        {
            try
            {
                conn.close();
            }
            catch(Throwable t)
            {
                t.printStackTrace();
            }
        }
    }
    
    void closeSqlStatement(Statement statement)
    {
        if(statement == null)
        {
            System.out.println("Statement was not open");
        }
        else
        {
            try
            {
                statement.close();
            }
            catch(Throwable t)
            {
                t.printStackTrace();
            }
        }
    }    
}
