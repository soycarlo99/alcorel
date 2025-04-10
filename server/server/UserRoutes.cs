using System.Diagnostics;
using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;

namespace Server;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

public enum UserRole
{
    admin,
    customer,
    employee,
}

public static class UserRoutes
{
    public record User(int Id, string Name);

    public record PostUserDTO(
        string Name,
        string Email,
        string Password,
        string admin_customer_employee,
        int company_id
    );

    public record CreationOfTicketDTO(string Name, string Email, string Message, int Category_id);

    public record Ticket(string Message, int Category_id);

    record VerifyDTO(string Password, string Hash);

    public static async Task<List<User>> GetUsers(NpgsqlDataSource db)
    {
        List<User> result = new();

        using var query = db.CreateCommand("SELECT id, name FROM testuser");
        using var reader = await query.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(new(reader.GetInt32(0), reader.GetString(1)));
        }

        return result;
    }

    public static async Task<Results<Created<User>, BadRequest<string>>> PostUser(
        PostUserDTO userDto,
        NpgsqlDataSource db
    )
    {
        using var command = db.CreateCommand(
            "INSERT INTO testuser (name, email, password, admin_customer_employee, company_id) VALUES (@name, @email, @password, @role::user_role, @company_id) RETURNING id, name"
        );
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

    public static async Task<Results<Ok<string>, BadRequest<string>>> CreationOfTicket(
        CreationOfTicketDTO ticket_info,
        NpgsqlDataSource db,
        HttpContext ctx,
        IEmailService emailService
    )
    {
        int? companyId = ctx.Session.GetInt32("companyId");
        if (companyId == null)
        {
            return TypedResults.BadRequest("You don't have a company ID");
        }
        try
        {
            // TODO(manuel): Starta er transaction här
            // 1. kolla ifall en användare finns, om inte, skapa en
            using var insertUserCommand = db.CreateCommand(
                "INSERT INTO testuser (name, email, company_id, admin_customer_employee) values ($1, $2, $3, 'customer') ON CONFLICT DO NOTHING RETURNING id"
            );
            insertUserCommand.Parameters.AddWithValue(ticket_info.Name);
            insertUserCommand.Parameters.AddWithValue(ticket_info.Email);
            insertUserCommand.Parameters.AddWithValue(companyId.Value);

            var insertUserResult = await insertUserCommand.ExecuteScalarAsync();

            // 2. Skapa en ny ticket kopplat till användaren, och deras problem
            string accessToken = Guid.NewGuid().ToString("N");
            await emailService.SendEmailAsync(
                to: ticket_info.Email,
                subject: "Welcome to Alcorel - Support Ticket Confirmation",
                body: $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>
            <div style='text-align: center; margin-bottom: 20px;'>
                <h1 style='color: #2c3e50;'>Hi {ticket_info.Name}, Thank You for Contacting Us</h1>
            </div>
            
            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
                Thank you for reaching out to our customer support team. We've received your inquiry and are working on it.
            </p>
            
            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
                To help us serve you better, please answer a few additional questions by clicking the link below:
            </p>
            
            <div style='text-align: center; margin: 30px 0;'>
                <a href='http://localhost:5173/customer-view/{accessToken}' style='background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;'>
                    Complete Additional Questions
                </a>
<p style='font-size: 16px; line-height: 1.5; color: #333;'>
                if the button doesn't work click on the link below:
            </p>
                <a href='http://localhost:5173/customer-view/{accessToken}' style='background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;'>
                   www.alcorel.com/customerservice 
                </a>

            </div>
            
            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
                Your responses will help us address your concerns more effectively. We appreciate your cooperation.
            </p>
            
            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
                We'll get back to you as soon as possible.
            </p>
            
            <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #7f8c8d;'>
                Powered by <span style='font-weight: bold;'>Alcorel<sup>&reg;</sup></span>
            </div>
        </div>
    "
            );
            if (insertUserResult is int userId)
            {
                using var insertTicketCommand = db.CreateCommand(
                    "INSERT INTO ticket(category_id, user_id, access_token) values($1, $2, $3) RETURNING id"
                );
                insertTicketCommand.Parameters.AddWithValue(ticket_info.Category_id);
                insertTicketCommand.Parameters.AddWithValue(userId);
                insertTicketCommand.Parameters.AddWithValue(accessToken);

                var insertTicketResult = await insertTicketCommand.ExecuteScalarAsync();

                if (insertTicketResult is int ticketId)
                {
                    // 3. Skapa ett nytt ticket-message med användarens meddelande
                    using var insertTicketMessageCommand = db.CreateCommand(
                        "INSERT INTO ticket_messages(ticket_id, message) values($1, $2)"
                    );
                    insertTicketMessageCommand.Parameters.AddWithValue(ticketId);
                    insertTicketMessageCommand.Parameters.AddWithValue(ticket_info.Message);
                    await insertTicketMessageCommand.ExecuteNonQueryAsync();

                    // Avsluta er transaction
                    return TypedResults.Ok("added user and ticket successfully");
                }

                return TypedResults.Ok("Added successfully yes");
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

    public static async Task<Results<Ok<string>, BadRequest<string>>> CheckCredentials(
        LoginDTO loginDto,
        NpgsqlDataSource db
    )
    {
        using var command = db.CreateCommand(
            @"
            SELECT id, name, email, admin_customer_employee
            FROM testuser
            WHERE email = @email AND password = @password"
        );

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

    public record GetAllDTO(int Id, string Name, UserRole UserRole);

    public static async Task<
        Results<Ok<List<GetAllDTO>>, UnauthorizedHttpResult, ForbidHttpResult>
    > GetAll(NpgsqlDataSource db, HttpContext ctx)
    {
        if (
            ctx.Session.IsAvailable
            && ctx.Session.GetInt32("role") is int role
            && Enum.IsDefined(typeof(UserRole), role)
        )
        {
            if ((UserRole)role == UserRole.admin)
            {
                Console.WriteLine(ctx.Session.GetInt32("company_id"));

                List<GetAllDTO> users = new();

                var cmd = db.CreateCommand(
                    "select id, name, admin_customer_employee from testuser"
                );
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    users.Add(
                        new(
                            reader.GetInt32(0),
                            reader.GetString(1),
                            reader.GetFieldValue<UserRole>(2)
                        )
                    );
                }

                return TypedResults.Ok(users);
            }
            else
            {
                return TypedResults.Forbid();
            }
        }
        else
        {
            return TypedResults.Unauthorized();
        }
    }

    public record Credentials(string Email, string? Password);

    public record LoginResponse(string redirectPath, int companyId);

    public static async Task<IResult> Post(
        Credentials credentials,
        NpgsqlDataSource db,
        HttpContext ctx,
        PasswordHasher<string> hasher
    )
    {
        var cmd = db.CreateCommand(
            "select name, admin_customer_employee, company_id, password, id from testuser where email = $1"
        );
        cmd.Parameters.AddWithValue(credentials.Email);

        using var reader = await cmd.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            var role = reader.GetFieldValue<UserRole>(1);
            var companyId = reader.GetInt32(2);
            string hashedPassword = reader.GetString(3);
            int id = reader.GetInt32(4);
            var verifyResult = hasher.VerifyHashedPassword(
                "",
                hashedPassword,
                credentials.Password
            );

            if (verifyResult == PasswordVerificationResult.Failed)
            {
                Console.WriteLine("NOT cracked");
                return TypedResults.BadRequest("Wrong credentials");
            }

            ctx.Session.SetString("name", reader.GetString(0));
            ctx.Session.SetInt32("role", (int)role);
            ctx.Session.SetInt32("companyId", companyId);
            ctx.Session.SetString("email", credentials.Email);
            ctx.Session.SetInt32("id", id);

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

    public static async Task<Results<Ok<LoginResponse>, BadRequest>> CustomerVisit(
        Credentials credentials,
        NpgsqlDataSource db,
        HttpContext ctx
    )
    {
        var cmd = db.CreateCommand(
            "select name, admin_customer_employee, company_id from testuser where email = $1"
        );
        cmd.Parameters.AddWithValue(credentials.Email);
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
            }

            return TypedResults.Ok(new LoginResponse(location, companyId));
        }
        else
        {
            return TypedResults.BadRequest();
        }
    }

    public record SignUpAdminDTO(
        string CompanyName,
        string Email,
        string AdminName,
        string orgNumber,
        string Password
    );

    public static async Task<IResult> SignUpAdmin(
        SignUpAdminDTO adminDto,
        NpgsqlDataSource db,
        PasswordHasher<string> hasher,
        IEmailService emailService
    )
    {
        using var companyCmd = db.CreateCommand(
            "INSERT INTO company (name, org_number, email, password) VALUES (@name, @orgNumber, @email, @password) RETURNING id"
        );
        string hashedPassword = hasher.HashPassword("", adminDto.Password);
        companyCmd.Parameters.AddWithValue("name", adminDto.CompanyName);
        companyCmd.Parameters.AddWithValue("orgNumber", adminDto.orgNumber);
        companyCmd.Parameters.AddWithValue("email", adminDto.Email);
        companyCmd.Parameters.AddWithValue("password", hashedPassword);

        try
        {
            var companyId = (int)await companyCmd.ExecuteScalarAsync();

            using var userCmd = db.CreateCommand(
                "INSERT INTO testuser (name, email, password, admin_customer_employee, company_id) VALUES (@name, @email, @password, 'admin'::user_role, @company_id) RETURNING id, name"
            );
            userCmd.Parameters.AddWithValue("name", adminDto.AdminName);
            userCmd.Parameters.AddWithValue("email", adminDto.Email);
            userCmd.Parameters.AddWithValue("password", hashedPassword);
            userCmd.Parameters.AddWithValue("company_id", companyId);

            //send welcome email
            await emailService.SendEmailAsync(
                to: adminDto.Email,
                subject: "Welcome to Alcorel",
                body: $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>
            <div style='text-align: center; margin-bottom: 20px;'>
                <h1 style='color: #2c3e50;'>Hi {adminDto.AdminName}, Thank You for using our services</h1>
            </div>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='http://localhost:5173/admin/dashboard' style='background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;'>
                   www.alcorel.com/admin/dashboard
                </a>

            </div>
            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
Don't hesitate to contact us if you need guidance
            </p>
            <a href='mailto:support@alcorel.com'>support@alcorel.com</a>

            <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #7f8c8d;'>
                Powered by <span style='font-weight: bold;'>Alcorel<sup>&reg;</sup></span>
            </div>
        </div>
    "
            );

            using var reader = await userCmd.ExecuteReaderAsync();
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
}
