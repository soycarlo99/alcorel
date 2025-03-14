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



public record UpdateLogotypeDTO(string logotype);
    public static async Task<Results<Ok<string>, BadRequest<string>>>
    UpdateCompanyLogo(int companyId, UpdateLogotypeDTO LogoDto, NpgsqlDataSource db)
    {
        string newLogo = LogoDto.logotype;

        using var command = db.CreateCommand(@"
            UPDATE company
            SET logotype = @logotype
            WHERE id = @companyId
            RETURNING id");

        command.Parameters.AddWithValue("logotype", LogoDto.logotype);
        command.Parameters.AddWithValue("companyId", companyId);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return TypedResults.Ok($"logotype updated for ticket {reader.GetInt32(0)}");
            }
            return TypedResults.BadRequest("Failed to update ticket logotype");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }


}








//SELECT name FROM company WHERE id = 2;
