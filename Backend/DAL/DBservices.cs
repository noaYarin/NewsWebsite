using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlClient;
using System.Data;
using System.Text;
using Horizon.BL;
using System.Xml.Linq;
using System.Data.Common;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;


public class DBservices
{
    public DBservices() { }

    public SqlConnection connect(String conString)
    {
        IConfigurationRoot configuration = new ConfigurationBuilder()
        .AddJsonFile("appsettings.json").Build();
        string cStr = configuration.GetConnectionString("myProjDB");
        SqlConnection con = new SqlConnection(cStr);
        con.Open();
        return con;
    }


    /*
     ----------------------------------------------------------------------
    User
     ----------------------------------------------------------------------
     */

    /*Insert user - register */

    public int InsertUser(User user)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@Email", user.Email);
        paramDic.Add("@FirstName", user.FirstName);
        paramDic.Add("@LastName", user.LastName);
        paramDic.Add("@HashedPassword", user.HashedPassword);
        paramDic.Add("@ImgUrl", user.ImgUrl);
        paramDic.Add("@BirthDate", user.BirthDate);
        paramDic.Add("@IsAdmin", user.IsAdmin);
        paramDic.Add("@IsLocked", user.IsAdmin);


        cmd = CreateCommandWithStoredProcedureGeneral("SP_InsertUser", con, paramDic);

        try
        {
            int numEffected = cmd.ExecuteNonQuery();
            return numEffected;
        }

        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }

    /*Add user tags */
    public int InsertUserTags(int userId , Tag tag)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserId", userId);
        paramDic.Add("@TagName", tag.Name);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_InsertUserTags", con, paramDic);

        try
        {
            int numEffected = cmd.ExecuteNonQuery();
            return numEffected;
        }

        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }


    /*Add user articles */
    public int InsertUserSavedArticles(int userId, Article article)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserId", userId);
        paramDic.Add("@Title", article.Title);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_InsertUserArticles", con, paramDic);

        try
        {
            int numEffected = cmd.ExecuteNonQuery();
            return numEffected;
        }

        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }

    /*Get user by id*/
    public User GetUserById(int id)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@Id", id);


        cmd = CreateCommandWithStoredProcedureGeneral("SP_GetUserById", con, paramDic);
        SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

        try
        {
            User user = new User();
            while (dataReader.Read())
            {
                user = new User
                {
                    Id = Convert.ToInt32(dataReader["Id"]),
                    Email = dataReader["Email"].ToString(),
                    FirstName = dataReader["FirstName"].ToString(),
                    LastName = dataReader["LastName"].ToString(),
                    BirthDate = dataReader["BirthDate"].ToString(),
                    ImgUrl = dataReader["ImgUrl"].ToString(),
                    IsAdmin = Convert.ToBoolean(dataReader["IsAdmin"]),
                    IsLocked = Convert.ToBoolean(dataReader["IsLocked"]),
                    HashedPassword = dataReader["HashedPassword"].ToString()
                };
            }

            return user;
        }

        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }

    /*Update user by id*/
    public bool UpdateUser(int id, User updatedUser)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserId", id);
        paramDic.Add("@Id", updatedUser.Id);
        paramDic.Add("@Email", updatedUser.Email);
        paramDic.Add("@FirstName", updatedUser.FirstName);
        paramDic.Add("@LastName", updatedUser.LastName);
        paramDic.Add("@HashedPassword", updatedUser.HashedPassword);
        paramDic.Add("@ImgUrl", updatedUser.ImgUrl);
        paramDic.Add("@BirthDate", updatedUser.BirthDate);
        paramDic.Add("@IsAdmin", updatedUser.IsAdmin);
        paramDic.Add("@IsLocked", updatedUser.IsAdmin);


        cmd = CreateCommandWithStoredProcedureGeneral("SP_UpdateUser", con, paramDic);

        try
        {
            cmd.ExecuteNonQuery();
            return true;
        }

        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }


    /*Insert user - login */

    public int logIn(string email,string password)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@Email", email);
        paramDic.Add("@HashedPassword", password);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_logIn", con, paramDic);

        try
        {
            int numEffected = cmd.ExecuteNonQuery();
            return numEffected;
        }

        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }


    /*Check if user exists*/
    public bool IsUserExists(string email,string hashedPassword, bool logIn)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@hashedPassword", hashedPassword);
        paramDic.Add("@email", email);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_IsUserExists", con, paramDic);
        SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

        try
        {
            while (dataReader.Read())
            {
                if (logIn)
                {
                    if (!string.IsNullOrEmpty(dataReader["Email"].ToString()) && !string.IsNullOrEmpty(dataReader["HashedPassword"].ToString()))
                    {
                        return true;
                    }
                }
                else
                {
                    if (!string.IsNullOrEmpty(dataReader["Email"].ToString()))
                    {
                        return true;
                    }
                }
              
            }
            return false;

        }
        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }


    /*Get user by email after logIn*/
    public User GetUserByEmail(string email)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@Email", email);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_GetUserByEmail", con, paramDic);
        SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

        try
        {
            User user = new User();
            while (dataReader.Read())
            {
                 user = new User
                {
                    Id = Convert.ToInt32(dataReader["Id"]),
                    Email = dataReader["Email"].ToString(),
                    FirstName = dataReader["FirstName"].ToString(),
                    LastName = dataReader["LastName"].ToString(),
                    BirthDate = dataReader["BirthDate"].ToString(),
                    ImgUrl = dataReader["ImgUrl"].ToString(),
                    IsAdmin = Convert.ToBoolean(dataReader["IsAdmin"]),
                    IsLocked = Convert.ToBoolean(dataReader["IsLocked"]),
                    HashedPassword = dataReader["HashedPassword"].ToString()
                };
            }

            return user;
        }
        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }


    /*Get all users*/
    public List<User> GetAllUsers()
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }

        cmd = CreateCommandWithStoredProcedureGeneral("SP_GetAllUsers", con, null);
        string res = "";

        SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

        try
        {
                while (dataReader.Read())
                {
                    res += dataReader.GetString(0); 
                }

            if (!string.IsNullOrWhiteSpace(res))
            {
                //Convert it to JSON obj
                List<User> users = JsonSerializer.Deserialize<List<User>>(res);
                return users ?? new List<User>(); // If users not null return it
            }
            else
            {
                return new List<User>();
            }
        }

        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }

    /*Add blocked user*/
    public int InsertBlockedUser(int userId, User blockedUser)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserId", userId);
        paramDic.Add("@Id", blockedUser.Id);
        paramDic.Add("@Email", blockedUser.Email);
        paramDic.Add("@FirstName", blockedUser.FirstName);
        paramDic.Add("@LastName", blockedUser.LastName);
        paramDic.Add("@HashedPassword", blockedUser.HashedPassword);
        paramDic.Add("@ImgUrl", blockedUser.ImgUrl);
        paramDic.Add("@BirthDate", blockedUser.BirthDate);
        paramDic.Add("@IsAdmin", blockedUser.IsAdmin);
        paramDic.Add("@IsLocked", blockedUser.IsAdmin);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_InsertBlockedUser", con, paramDic);

        try
        {
            int numEffected = cmd.ExecuteNonQuery();
            return numEffected;

        }
        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }

    /* Delete blocked user*/
    public int DeleteBlockedUser(int userId, int blockedUserId)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserId", userId);
        paramDic.Add("@BlockedUserId", blockedUserId);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_DeleteBlockedUser", con, paramDic);

        try
        {
            int numEffected = cmd.ExecuteNonQuery();
            return numEffected;

        }
        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }


    /* Delete saved article by id*/
    public int DeleteSavedArticle(int userId, int articleId)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserId", userId);
        paramDic.Add("@ArticleId", articleId);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_DeleteSavedArticle", con, paramDic);

        try
        {
            int numEffected = cmd.ExecuteNonQuery();
            return numEffected;

        }
        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }


    /* Delete saved article by id*/
    public int DeleteUserTag(int userId, int tagId)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserId", userId);
        paramDic.Add("@TagId", tagId);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_DeleteUserTag", con, paramDic);

        try
        {
            int numEffected = cmd.ExecuteNonQuery();
            return numEffected;

        }
        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }


    /*
    ----------------------------------------------------------------------------
    Article
    ----------------------------------------------------------------------------
     */

    /*Get all articles*/
    public List<Article> GetAllArticles()
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        cmd = CreateCommandWithStoredProcedureGeneral("SP_GetAllArticles", con, null);
        SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
        List<Article> articles = new List<Article>();

        try
        {
            Article article = new Article();
            while (dataReader.Read())
            {
                article = new Article
                {
                    Id = Convert.ToInt32(dataReader["Id"]),
                    UserId = Convert.ToInt32(dataReader["Id"]),
                    Title = dataReader["Title"].ToString(),
                    PublishDate = Convert.ToDateTime(dataReader["PublishDate"]),
                    Tags = new List<Tag>(),
                    Comments = new List<Comment>(),
                    Reports = new List<Report>()
                };
                articles.Add(article);
            }

            return articles;
        }
        catch (Exception ex)
        {
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }

    }

    private SqlCommand CreateCommandWithStoredProcedureGeneral(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {
        SqlCommand cmd = new SqlCommand();
        cmd.Connection = con;
        cmd.CommandText = spName;
        cmd.CommandTimeout = 10;
        cmd.CommandType = System.Data.CommandType.StoredProcedure;
        if (paramDic != null)
            foreach (KeyValuePair<string, object> param in paramDic)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);

            }
        return cmd;
    }
}
