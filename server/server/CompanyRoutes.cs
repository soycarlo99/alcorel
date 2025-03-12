using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;


public static class CompanyRoutes
{


    public record Company(
        string company,
        string logotype
    );



    public static async Task<List<Company>> GetCompanyName(NpgsqlDataSource db, int companyId)
    {
        List<Company> result = new();
        using var query = db.CreateCommand("SELECT name, logotype FROM company WHERE id = @companyId");
        query.Parameters.AddWithValue("@companyId", companyId);
        
        using var reader = await query.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            result.Add(new(
                reader.GetString(0),
                reader.GetString(1)
            ));
        }
        return result;
    }




}








//SELECT name FROM company WHERE id = 2;