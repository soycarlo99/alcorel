using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;


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
        string admin_customer_employee,
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
        string admin_customer_employee
    // int company_id
    );

    public record DeleteEmployeeDTO(
        int id,
        string name,
        string email,
        string password,
        bool pending_confirmed,
        string admin_customer_employee,
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

    record HashDTO(string Password);

    /////////////////////////
    ///TheEnd!!!!!!!!!!!!!!!!
    /////////////////////////


    public static async Task<List<GetEmployeeDTO>> GetEmployee(NpgsqlDataSource db, HttpContext ctx)
    {
        int? companyId = ctx.Session.GetInt32("companyId");
        int? role = ctx.Session.GetInt32("role");
        if (companyId == null || role == 1 || role == 2)
        {
            return new List<GetEmployeeDTO>();
        }

        List<GetEmployeeDTO> result = new();
        using var query = db.CreateCommand("SELECT id, name, email, password, pending_confirmed, company_id FROM testuser WHERE admin_customer_employee = 'employee' AND company_id = @companyId");
        query.Parameters.AddWithValue("companyId", companyId);
        using var reader = await query.ExecuteReaderAsync();



        while (await reader.ReadAsync())
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
        PostEmployee(PostEmployeeDTO employeeDto, NpgsqlDataSource db, PasswordHasher<string> hasher, HttpContext ctx, IEmailService emailService)
    {
        int? companyId = ctx.Session.GetInt32("companyId");
        int? role = ctx.Session.GetInt32("role");
        if (companyId == null || role == 1 || role == 2)
        {
            return TypedResults.BadRequest("You don't have a company ID nor a role");
        }

        using var command = db.CreateCommand(@"
        INSERT INTO testuser 
            (name, email, password, pending_confirmed, admin_customer_employee, company_id) 
        VALUES 
            (@name, @email, @password, @pending_confirmed, @role::user_role, @company_id)  
        RETURNING 
            id, name, email, password, pending_confirmed, admin_customer_employee, company_id");

        string hashedPassword = hasher.HashPassword("", "welcome");
        command.Parameters.AddWithValue("name", employeeDto.name);
        command.Parameters.AddWithValue("email", employeeDto.email);
        command.Parameters.AddWithValue("password", hashedPassword);
        command.Parameters.AddWithValue("pending_confirmed", employeeDto.pending_confirmed);
        command.Parameters.AddWithValue("role", employeeDto.admin_customer_employee);
        command.Parameters.AddWithValue("company_id", companyId);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var employee = new Employee(
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetBoolean(4),
                    reader.GetString(5),
                    reader.GetInt32(6)
                );


                await emailService.SendEmailAsync(
    to: employeeDto.email,
    subject: "Welcome onboard!",
    body: $@"
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>
        <div style='text-align: center; margin-bottom: 20px;'>
            <h1 style='color: #2c3e50;'>Welcome Onboard!</h1>
            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
                Hi {employeeDto.name},
            </p>
            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
                The admin has now created an account for you in our system. You can log in using your email and the default password: <strong>welcome</strong>
            </p>
            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
                Please log in as soon as possible. You'll be prompted to change it to a stronger password for your security.
            </p>
            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
                We're excited to have you join us! If you need any assistance getting started, don't hesitate to reach out to our support team.
            </p>
        </div>
        <div style='text-align: center; margin: 30px 0;'>
            <a href='http://localhost:5173/login' style='background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;'>
               Log In Now
            </a>
        </div>
        <p style='font-size: 16px; line-height: 1.5; color: #333; text-align: center;'>
            Best of luck in your new role!
        </p>
        <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #7f8c8d;'>
            Powered by <span style='font-weight: bold;'>Alcorel<sup>&reg;</sup></span>
        </div>
    </div>
"
);
                return TypedResults.Created($"/api/Employee/{employee.id}", employee);
            }
            return TypedResults.BadRequest("Failed to create employee");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }


    public static async Task<Results<Ok<string>, BadRequest<string>>>
    RemoveEmployee(int testuserId, NpgsqlDataSource db, HttpContext ctx)
    {
        using var command = db.CreateCommand(@"DELETE FROM testuser WHERE id = @selected_employee");

        command.Parameters.AddWithValue("selected_employee", testuserId);

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

    public record PasswordResetDTO(string NewPassword);
    
    public static async Task<IResult> SendResetLink(int testuserId, NpgsqlDataSource db, PasswordHasher<string> hasher, IEmailService emailService)
    {
        string token = Guid.NewGuid().ToString();

        using var command = db.CreateCommand(@"UPDATE testuser SET password = @hashedwelcome, reset_token = @resetToken WHERE id = @userid  RETURNING email");

        string hashedPassword = hasher.HashPassword("", "welcome");
        command.Parameters.AddWithValue("resetToken", token);
        command.Parameters.AddWithValue("hashedwelcome", hashedPassword);
        command.Parameters.AddWithValue("userid", testuserId);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
         
            if(await reader.ReadAsync())
            {
                string email = reader.GetString(0);
                
                
                string resetUrl = $"http://localhost:5173/reset-password?token={token}&id={testuserId}";
                
                await emailService.SendEmailAsync(
                    to: email,
                    subject: "Password Reset Link",
                    body: $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>
                            <div style='text-align: center; margin-bottom: 20px;'>
                                <h1 style='color: #2c3e50;'>Password Reset</h1>
                            </div>
                            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
                                Your password has been temporarily set to <strong>welcome</strong>. Please click the link below to set a new password:
                            </p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{resetUrl}' style='background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;'>
                                    Set New Password
                                </a>
                            </div>
                            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
                                If the button doesn't work, you can copy and paste this link into your browser:
                            </p>
                            <p style='font-size: 14px; background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;'>
                                {resetUrl}
                            </p>
                            <p style='font-size: 16px; line-height: 1.5; color: #333;'>
                                Don't hesitate to contact us if you need guidance:
                            </p>
                            <a href='mailto:support@alcorel.com'>support@alcorel.com</a>

                            <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #7f8c8d;'>
                                Powered by <span style='font-weight: bold;'>Alcorel<sup>&reg;</sup></span>
                            </div>
                        </div>
                    "
                );
                
                return TypedResults.Ok($"Reset link sent to employee's email");
            }
            else
            {
                return TypedResults.BadRequest("No employee found with the given ID");
            }
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
    
    public static async Task<IResult> ResetPasswordWithLink(string resetToken, PasswordResetDTO passwordResetDTO, NpgsqlDataSource db, PasswordHasher<string> hasher)
    {
        if (string.IsNullOrEmpty(passwordResetDTO.NewPassword))
        {
            return Results.BadRequest(new { error = "New password is required" });
        }
        
        using var command = db.CreateCommand(@"UPDATE testuser SET password = @password WHERE reset_token = @resetToken RETURNING email");
        string hashedPassword = hasher.HashPassword("", passwordResetDTO.NewPassword);
        command.Parameters.AddWithValue("resetToken", resetToken);
        command.Parameters.AddWithValue("password", hashedPassword);
        
        try
        {
            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return Results.Ok(new { message = "Password has been successfully reset" });
            }
            
            return Results.NotFound(new { error = "User not found" });
        }
        catch (PostgresException ex)
        {
            return Results.BadRequest(new { error = $"Database error: {ex.Message}" });
        }
    }

    public static async Task<IResult> CheckDefaultPassword(int userId, NpgsqlDataSource db, PasswordHasher<string> hasher)
    {
        using var command = db.CreateCommand("SELECT password FROM testuser WHERE id = @userId");
        command.Parameters.AddWithValue("userId", userId);
        
        try
        {
            var storedHash = await command.ExecuteScalarAsync() as string;
            
            if (storedHash == null)
            {
                return TypedResults.NotFound("User not found");
            }
            
            var verificationResult = hasher.VerifyHashedPassword("", storedHash, "welcome");
            
            if (verificationResult == PasswordVerificationResult.Success)
            {
                return TypedResults.BadRequest("You are using the default password, please change your password");
            }
            
            return TypedResults.Ok("Password is not the default");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }

    public static async Task<IResult> ValidateResetToken(string resetToken, NpgsqlDataSource db)
    {
        if (string.IsNullOrEmpty(resetToken))
        {
            return Results.BadRequest(new { valid = false, error = "Reset token is required" });
        }
        
        using var command = db.CreateCommand(@"SELECT id FROM testuser WHERE reset_token = @resetToken");
        command.Parameters.AddWithValue("resetToken", resetToken);
        
        try
        {
            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                int userId = reader.GetInt32(0);
                return Results.Ok(new { valid = true, userId, message = "Token is valid" });
            }
            
            return Results.NotFound(new { valid = false, error = "Invalid or expired reset token" });
        }
        catch (PostgresException ex)
        {
            return Results.BadRequest(new { valid = false, error = $"Database error: {ex.Message}" });
        }
    }
}

