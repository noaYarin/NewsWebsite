    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using System.Data.SqlClient;
    using System.Data;
    using System.Text;
    using System.Data.Common;
using NewsSiteBackEnd.BL;


namespace NewsSiteBackEnd.DAL
    {
        public class DBservices
        {
            public DBservices()
            {
            }

            public SqlConnection connect(String conString)
            {
                IConfigurationRoot configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json").Build();
                string cStr = configuration.GetConnectionString("myProjDB");
                SqlConnection con = new SqlConnection(cStr);
                con.Open();
                return con;
            }

            private SqlCommand CreateCommandWithStoredProcedure(String spName, SqlConnection con)
            {

                SqlCommand cmd = new SqlCommand(); 
                cmd.Connection = con; 
                cmd.CommandText = spName;     
                cmd.CommandTimeout = 10; 
                cmd.CommandType = System.Data.CommandType.StoredProcedure; 

            return cmd;
            }

        //---------------------------------------------------------------------------------
        // Create the SqlCommand
        //---------------------------------------------------------------------------------
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

    }
