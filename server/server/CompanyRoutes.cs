using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;

public static class CompanyRoutes
{
    public record Credentials(string Email, string Password);
    public record LoginResponse(string redirectPath, int companyId);

    public static async Task<Results<Ok<LoginResponse>, BadRequest>>
        GetCompany(Credentials credentials, NpgsqlDataSource db, HttpContext ctx)
    {
        var cmd = db.CreateCommand("SELECT name, admin_customer_employee, company_id FROM testuser WHERE email = $1 AND password = $2");
        cmd.Parameters.AddWithValue(credentials.Email);
        cmd.Parameters.AddWithValue(credentials.Password);
        using var reader = await cmd.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            var role = reader.GetFieldValue<UserRole>(1);
            var companyId = reader.GetInt32(2);

            ctx.Session.SetString("name", reader.GetString(0));
            ctx.Session.SetInt32("role", (int)role);
            ctx.Session.SetInt32("companyId", companyId);

            string location = "";
            switch (role)
            {
                case UserRole.customer:
                {
                    location = "/customer/dashboard";
                }
                    break;

                case UserRole.employee:
                {
                    location = "/employee/dashboard";
                }
                    break;

                case UserRole.admin:
                {
                    location = "/admin/dashboard";
                }
                    break;
            }

            return TypedResults.Ok(new LoginResponse(location, companyId));
        }
        else
        {
            return TypedResults.BadRequest();
        }
    }



}