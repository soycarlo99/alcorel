using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;


public static class CompanyRoutes
{


    public record Name(
        string name
    );



    public static async Task<List<Name>> GetCompanyName(NpgsqlDataSource db, int companyId)
    {
        List<Name> result = new();
        using var query = db.CreateCommand("SELECT name FROM company WHERE id = @companyId");
       query.Parameters.AddWithValue("@companyId");

       
       using var reader = await query.ExecuteReaderAsync();
       if (await reader.ReadAsync())
       {
           result.Add(new Name(reader.GetString(0)));
       }
       
        return result;
    }




}








//SELECT name FROM company WHERE id = 2;