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

        List<User> users = new List<User>();

        SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

        try
        {

            while (dataReader.Read())
            {

                int userId = Convert.ToInt32(dataReader["Id"]);
                User user = users.FirstOrDefault(u => u.Id == userId);
                if (user == null)
                {
                    user = new User
                    {
                        Id = userId,
                        Email = dataReader["Email"].ToString(),
                        FirstName = dataReader["FirstName"].ToString(),
                        LastName = dataReader["LastName"].ToString(),
                        BirthDate = dataReader["BirthDate"].ToString(),
                        ImgUrl = dataReader["ImgUrl"].ToString(),
                        IsAdmin = Convert.ToBoolean(dataReader["IsAdmin"]),
                        IsLocked = Convert.ToBoolean(dataReader["IsLocked"]),
                        HashedPassword = dataReader["HashedPassword"].ToString(),
                        Tags = new List<Tag>(),
                        BlockedUsers = new List<User>(),
                        SavedArticles = new List<Article>()
                    };

                    users.Add(user);

                }

                if (dataReader["TagId"] != DBNull.Value)
                {
                    Tag userTag = new Tag
                    {
                        Id = Convert.ToInt32(dataReader["TagId"]),
                        Name = dataReader["TagName"].ToString(),
                        CreateDate = Convert.ToDateTime(dataReader["TagCreateDate"])
                    };

                    if (!user.Tags.Any(tag => tag.Id == userTag.Id))
                        user.Tags.Add(userTag);
                }

                if (dataReader["BlockedUserId"] != DBNull.Value)
                {
                    User blockedUser = new User
                    {
                        Id = Convert.ToInt32(dataReader["BlockedUserId"]),
                        FirstName = dataReader["BlockedUserFirstName"].ToString(),
                        LastName = dataReader["BlockedUserLastName"].ToString(),
                        Email = dataReader["BlockedUserEmail"].ToString(),
                        HashedPassword = dataReader["BlockedUserPassword"].ToString(),
                        ImgUrl = dataReader["BlockedUserImgUrl"].ToString(),
                        BirthDate = dataReader["BlockedUserBirthDate"].ToString(),
                        IsAdmin = Convert.ToBoolean(dataReader["BlockedUserIsAdmin"]),
                        Tags = new List<Tag>(),
                        BlockedUsers = new List<User>(),
                        SavedArticles = new List<Article>()
                    };

                    if (!user.BlockedUsers.Any(b => b.Id == blockedUser.Id))
                        user.BlockedUsers.Add(blockedUser);
                }

                if (dataReader["ArticleId"] != DBNull.Value)
                {
                    Article userArticle = new Article
                    {
                        Id = Convert.ToInt32(dataReader["ArticleId"]),
                        UserId = Convert.ToInt32(dataReader["Id"]),
                        Title = dataReader["ArticleTitle"].ToString(),
                        PublishDate = Convert.ToDateTime(dataReader["ArticlePublishDate"]),
                        Tags = new List<Tag>(),
                        Comments = new List<Comment>(),
                        Reports = new List<Report>()
                    };

                    if (!user.SavedArticles.Any(a => a.Id == userArticle.Id))
                        user.SavedArticles.Add(userArticle);
                }
            }
            return users;
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
    ----------------------------------------------------------------------------
     */


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
