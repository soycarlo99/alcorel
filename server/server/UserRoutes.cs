using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;
using Microsoft.AspNetCore.Mvc;

public static class UserRoutes
{
    public record User(int Id, string Name);
    public record PostUserDTO(string Name, string Email, string Password, string admin_customer_employee, int company_id);
    public record CreationOfTicketDTO(string Name, string Email, string Message, int Category_id);

    public record Ticket(string Message, int Category_id);


    public static async Task<List<User>> GetUsers(NpgsqlDataSource db)
    {
        List<User> result = new();

        using var query = db.CreateCommand("SELECT user_id, name FROM testuser");
        using var reader = await query.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(new(reader.GetInt32(0), reader.GetString(1)));
        }

        return result;
    }

    public static async Task<Results<Created<User>, BadRequest<string>>>
    PostUser(PostUserDTO userDto, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand("INSERT INTO testuser (name, email, password, admin_customer_employee, company_id) VALUES (@name, @email, @password, @role::user_role, @company_id) RETURNING user_id, name");
        command.Parameters.AddWithValue("name", userDto.Name);
        command.Parameters.AddWithValue("email", userDto.Email);
        command.Parameters.AddWithValue("password", userDto.Password);
        command.Parameters.AddWithValue("role", userDto.admin_customer_employee);
        command.Parameters.AddWithValue("company_id", userDto.company_id);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var user = new User(reader.GetInt32(0), reader.GetString(1));
                return TypedResults.Created($"/api/users/{user.Id}", user);
            } else {
            return TypedResults.BadRequest("Failed to create user");
            }
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }






    public static async Task<Results<Ok<string>, BadRequest<string>>>
       CreationOfTicket(CreationOfTicketDTO userDto, NpgsqlDataSource db)

    {
        using var userCommand = db.CreateCommand("INSERT INTO testuser (name, email) VALUES (@name, @email) RETURNING name, email");
        using var messageCommand = db.CreateCommand("INSERT INTO ticket_messages (message) VALUES(@message) RETURNING message");
        using var ticketCommand = db.CreateCommand("INSERT INTO ticket (category_id) VALUES(@category_id) RETURNING category_id");
        userCommand.Parameters.AddWithValue("name", userDto.Name);
        userCommand.Parameters.AddWithValue("email", userDto.Email);
        messageCommand.Parameters.AddWithValue("message", userDto.Message);
        ticketCommand.Parameters.AddWithValue("category_id", userDto.Category_id);

        try
        {
            using var reader = await userCommand.ExecuteReaderAsync();
            using var readerMes = await messageCommand.ExecuteReaderAsync();
            using var readerCat = await ticketCommand.ExecuteReaderAsync();
            if (await reader.ReadAsync() && await readerMes.ReadAsync() && await readerCat.ReadAsync())
            {
                var user = new CreationOfTicketDTO(reader.GetString(0), reader.GetString(1), readerMes.GetString(2), readerCat.GetInt32(3));

                return TypedResults.Ok("Added successfuly");


            }
            else
            {
                return TypedResults.BadRequest($"Error:");
            }
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }

    }















    public record LoginDTO(string Email, string Password);

    public static async Task<Results<Ok<string>, BadRequest<string>>>
        CheckCredentials(LoginDTO loginDto, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"
            SELECT user_id, name, email, admin_customer_employee
            FROM testuser
            WHERE email = @email AND password = @password");

        command.Parameters.AddWithValue("email", loginDto.Email);
        command.Parameters.AddWithValue("password", loginDto.Password);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return TypedResults.Ok($"User authenticated successfully");
            }
            return TypedResults.BadRequest("Invalid credentials");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}