using System.Data;
using System.Data.SqlClient;
using Horizon.BL;

namespace Horizon.DAL;

public class TagService : DBService
{
    public bool AddTag(Tag tag)
    {
        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object>
            {
                { "@Name", tag.Name },
                { "@ImageUrl", tag.ImageUrl }
            };
            SqlCommand cmd = CreateCommand("SP_InsertTag", con, parameters);
            int result = Convert.ToInt32(cmd.ExecuteScalar());
            return result == 1;
        }
        finally { con?.Close(); }
    }

    public bool TagsExist(List<string> tagNames)
    {
        var table = new DataTable();
        table.Columns.Add("Name", typeof(string));
        foreach (var name in tagNames)
        {
            table.Rows.Add(name);
        }

        SqlConnection con = null;
        try
        {
            con = Connect();
            var parameters = new Dictionary<string, object> { { "@TagNames", table } };
            SqlCommand cmd = CreateCommand("SP_CheckTagsExist", con, parameters);
            cmd.Parameters["@TagNames"].TypeName = "dbo.NameList";

            int result = Convert.ToInt32(cmd.ExecuteScalar());
            return result == 1;
        }
        finally { con?.Close(); }
    }
}