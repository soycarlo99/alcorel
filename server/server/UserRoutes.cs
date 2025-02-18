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
            }
            return TypedResults.BadRequest("Failed to create user");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }



    public static async Task<Results<Ok<string>, BadRequest<string>>>
    CreationOfTicket(CreationOfTicketDTO ticket_info, NpgsqlDataSource db)
    {
        try
        {
            // TODO(manuel): Starta er transaction här
            // 1. kolla ifall en användare finns, om inte, skapa en
            using var insertUserCommand = db.CreateCommand("INSERT INTO testuser (name, email) values ($1, $2) ON CONFLICT DO NOTHING RETURNING id");
            insertUserCommand.Parameters.AddWithValue(ticket_info.Name);
            insertUserCommand.Parameters.AddWithValue(ticket_info.Email);

            var insertUserResult = await insertUserCommand.ExecuteScalarAsync();
            
            
            // 2. Skapa en ny ticket kopplat till användaren, och deras problem
            if (insertUserResult is int userId)
            {
                using var insertTicketCommand = db.CreateCommand("INSERT INTO ticket(category_id, user_id) values($1, $2) RETURNING id");
                insertTicketCommand.Parameters.AddWithValue(ticket_info.Category_id);
                insertTicketCommand.Parameters.AddWithValue(userId);

                var insertTicketResult = await insertTicketCommand.ExecuteScalarAsync();

                if (insertTicketResult is int ticketId)
                {
                    // 3. Skapa ett nytt ticket-message med användarens meddelande
                    using var insertTicketMessageCommand = db.CreateCommand("INSERT INTO ticket_messages(ticket_id, message) values($1, $2)");
                    insertTicketMessageCommand.Parameters.AddWithValue(ticketId);
                    insertTicketMessageCommand.Parameters.AddWithValue(ticket_info.Message);
                    await insertTicketMessageCommand.ExecuteNonQueryAsync();

                    // Avsluta er transaction
                    return TypedResults.Ok("Added successfully");
                }
            }
            // This should never happen, since the ID we return from postgres will either happen, or it will be caugth as an exception by the try-catch
            return TypedResults.BadRequest("Something went wrong");
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