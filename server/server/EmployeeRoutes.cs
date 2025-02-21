using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;

public static class EmployeeRoutes
{

    public enum user_role
    {
      admin,
      customer,
      employee
    }

    public record Employee(
        int id,
        string name,
        string email,
        string password,
        bool pending_confirmed,
        user_role admin_customer_employee,
        int company_id
    );


    /////////////////////////
    ///Våran DTOs grabbar!!!!
    /////////////////////////

    public record PostEmployeeDTO(
        string name,
        string email,
        string password,
        bool pending_confirmed,
        user_role admin_customer_employee,
        int company_id
    );

    public record DeleteEmployeeDTO(
        int id,
        string name,
        string email,
        string password,
        bool pending_confirmed,
        user_role admin_customer_employee,
        int company_id
    );

    public record GetEmployeeDTO(
        int id,
        string name,
        string email,
        string password,
        bool pending_confirmed,
        int company_id
        );

    /////////////////////////
    ///TheEnd!!!!!!!!!!!!!!!!
    /////////////////////////


    public static async Task<List<GetEmployeeDTO>> GetEmployee(NpgsqlDataSource db)
    {
        List<GetEmployeeDTO> result = new();
        using var query = db.CreateCommand("SELECT id, name, email, password, pending_confirmed, company_id FROM testuser WHERE admin_customer_employee = 'employee'");
        using var reader = await query.ExecuteReaderAsync();
        
        while(await reader.ReadAsync())
        {
            result.Add(new(
                reader.GetInt32(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetBoolean(4),
                reader.GetInt32(5)
            ));
        }
        return result;
    }

    public static async Task<Results<Created<Employee>, BadRequest<string>>> 
        PostEmployee(PostEmployeeDTO EmployeeDto, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"
            INSERT INTO testuser (name, email, password, pending_confirmed, admin_customer_employee, company_id) 
            VALUES (@name, @email, @password, @pending_confirmed, @admin_customer_employee, @company_id) 
            RETURNING id, name, password, company_id");

        command.Parameters.AddWithValue("name", EmployeeDto.name);
        command.Parameters.AddWithValue("email", EmployeeDto.email);
        command.Parameters.AddWithValue("password", EmployeeDto.password);
        command.Parameters.AddWithValue("pending_confirmed", EmployeeDto.pending_confirmed);
        command.Parameters.AddWithValue("admin_customer_employee", EmployeeDto.admin_customer_employee.ToString());
        command.Parameters.AddWithValue("company_id", EmployeeDto.company_id);
        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
              var userRoleString = reader.GetString(4);
              if (Enum.TryParse(userRoleString, out user_role userRole))
            {

                var employee = new Employee(
                reader.GetInt32(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                EmployeeDto.pending_confirmed,
                userRole,
                reader.GetInt32(5)
                );
                return TypedResults.Created($"/api/Employee/{employee.id}", employee);
            }
              else
              {
                return TypedResults.BadRequest("Invalid role value from database");
              }
            }
            return TypedResults.BadRequest("Failed to create employee");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }


    public static async Task<Results<Ok<string>, BadRequest<string>>>
    RemoveEmployee(int Id, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"DELETE FROM testuser WHERE id = @selected_employee");
        
        command.Parameters.AddWithValue("selected_employee", Id);

        try
        {
            var rowsAffected = await command.ExecuteNonQueryAsync();

            if (rowsAffected > 0)
            {
                return TypedResults.Ok($"Deleted {rowsAffected} employee successfully");
            }
            else
            {
                return TypedResults.Ok("No employees deleted");
            }
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}
