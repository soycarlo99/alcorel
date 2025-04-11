using Microsoft.AspNetCore.Identity;
using Npgsql;
using Server;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<PasswordHasher<string>>();

var host = builder.Configuration["PG_HOST"] ?? "45.10.162.204";
var port = builder.Configuration["PG_PORT"] ?? "5432";
var username = builder.Configuration["PG_USER"] ?? "postgres";
var password = builder.Configuration["PG_PASSWORD"] ?? "FlickeringCustomerMoves29";
var database = builder.Configuration["PG_DATABASE"] ?? "postgres";

var dataSourceBuilder = new NpgsqlDataSourceBuilder(
    $"Host={host};Port={port};Username={username};Password={password};Database={database}"
);

dataSourceBuilder.EnableUnmappedTypes();
var databaseBuilder = dataSourceBuilder.Build();
builder.Services.AddSingleton<NpgsqlDataSource>(databaseBuilder);

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.IsEssential = true;
});

var emailSettings = builder.Configuration.GetSection("Email").Get<EmailSettings>();
if (emailSettings != null)
{
    builder.Services.AddSingleton(emailSettings);
}
else
{
    throw new InvalidOperationException("Email settings are not configured properly.");
}

builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();

app.UseSession();

//Serves front-end via static files in WWWROOT
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.MapPost("/api/email", SendEmail);

static async Task<IResult> SendEmail(EmailRequest request, IEmailService email)
{
    Console.WriteLine("SendEmail is called..Sending email");

    await email.SendEmailAsync(request.To, request.Subject, request.Body);

    Console.WriteLine(
        "Email sent to: "
            + request.To
            + " with subject: "
            + request.Subject
            + " and body: "
            + request.Body
    );
    return Results.Ok(new { message = "Email sent." });
}

//User APIs
app.MapGet("/api/users", UserRoutes.GetUsers);
app.MapPost("/api/createusers", UserRoutes.CreationOfTicket);
app.MapPost("/api/login", UserRoutes.Post);
app.MapPost("/api/customersesh", UserRoutes.CustomerVisit);
app.MapGet("/api/ticket/token/{token}", TicketRoutes.GetTicketByToken);

//app.MapPost("/api/users", UserRoutes.PostUser);
//app.MapPost("/api/login", UserRoutes.CheckCredentials);
app.MapGet(
    "/api/company/{companyId}/init",
    (int companyId, HttpContext ctx) =>
    {
        ctx.Session.SetInt32("companyId", companyId);
        ctx.Session.SetInt32("role", 1);
        return TypedResults.Ok(new { success = true });
    }
);

app.MapGet(
    "/api/session/userId",
    (HttpContext ctx) =>
    {
        var userId = ctx.Session.GetInt32("id");
        return TypedResults.Ok(new { userId = userId });
    }
);

app.MapGet(
    "/api/session/username",
    (HttpContext ctx) =>
    {
        var username = ctx.Session.GetString("name");
        return TypedResults.Ok(new { username = username });
    }
);

app.MapGet(
    "/api/company/current",
    (HttpContext ctx) =>
    {
        var companyId = ctx.Session.GetInt32("companyId");

        if (companyId.HasValue)
        {
            return Results.Ok(new { companyId = companyId.Value });
        }
        else
        {
            return Results.NotFound(new { error = "No company session found" });
        }
    }
);

app.MapGet(
    "/api/login/employee",
    (HttpContext ctx) =>
    {
        int? role = ctx.Session.GetInt32("role");
        if (role == 2)
        {
            return Results.Ok();
        }
        return TypedResults.BadRequest(new { success = false });
    }
);

app.MapGet(
    "/api/login/admin",
    (HttpContext ctx) =>
    {
        int? role = ctx.Session.GetInt32("role");
        if (role == 0)
        {
            return Results.Ok();
        }
        return TypedResults.BadRequest(new { success = false });
    }
);

//Ticket APIs
app.MapGet("/api/tickets", TicketRoutes.GetTickets);
app.MapPost("/api/tickets", TicketRoutes.PostTicket);
app.MapPut("/api/tickets/{ticketId}/status", TicketRoutes.UpdateTicketStatus);
app.MapGet("/api/DetailedTicket", TicketRoutes.GetDetailedTickets);
app.MapGet("/api/ticket/{id}", TicketRoutes.GetTicketById);
app.MapDelete("/api/delete/ticket/{ticket_id}", TicketRoutes.RemoveTicket);

//Question APIs
app.MapGet("/api/questions/{category_id}", QuestionRoutes.GetQuestion);
app.MapPost("/api/questions", QuestionRoutes.PostQuestions);
app.MapDelete("/api/questions/{id}", QuestionRoutes.DeleteQuestion);
app.MapPut("/api/update/question/{questionId}", QuestionRoutes.UpdateQuestion);

//Category APIs
app.MapGet("/api/GetCategory", CategoryRoutes.GetCategories);
app.MapGet("/api/GetCategory/{categoryId}", CategoryRoutes.GetCategoriesById);
app.MapPost("/api/PostCategory", CategoryRoutes.PostCategory);
app.MapDelete("/api/DeleteCategory/{categoryId}", CategoryRoutes.RemoveCategory);
app.MapPut("/api/update/category/{catId}", CategoryRoutes.UpdateCategories);

//Message APIs
app.MapPost("/api/{id}/message", MessageRoutes.PostMessage);
app.MapPost("/api/{ticketId}/{questionId}/postAnswer", AnswerRoutes.PostAnswer);

//Employee APIs
app.MapGet("/api/GetEmployee", EmployeeRoutes.GetEmployee);
app.MapPost("/api/PostEmployee", EmployeeRoutes.PostEmployee);
app.MapDelete("/api/DeleteEmployee/{testuserId}", EmployeeRoutes.RemoveEmployee);
app.MapGet(
    "/api/session/companyId",
    (HttpContext ctx) =>
    //app.MapPut("/api/ResetPassword/{testuserId}", EmployeeRoutes.PasswordResetRequest);
    {
        var companyId = ctx.Session.GetInt32("companyId");
        return TypedResults.Ok(new { companyId = companyId });
    }
);
app.MapGet(
    "/api/employee/dashboard",
    async (HttpContext ctx, NpgsqlDataSource db) =>
    {
        var companyId = ctx.Session.GetInt32("companyId");

        var result = await CompanyRoutes.GetCompanyName(db, companyId.Value);
        return Results.Ok(result);
    }
);
app.MapGet(
    "/api/admin/dashboard",
    async (HttpContext ctx, NpgsqlDataSource db) =>
    {
        var companyId = ctx.Session.GetInt32("companyId");

        var result = await CompanyRoutes.GetCompanyName(db, companyId.Value);
        return Results.Ok(result);
    }
);
app.MapPut("/api/update/logo/{companyId}", CompanyRoutes.UpdateCompanyLogo);
app.MapDelete("/api/delete/company/{companyId}", CompanyRoutes.RemoveCompany);

//Feedback APIs
app.MapPut("/api/sendRating/{rating}/{ticketId}", FeedbackRoutes.SendRating);

//app.MapGet("/api/GetRating", FeedbackRoutes.GetRating);

//Sign-up APIs
app.MapPost("api/signup", UserRoutes.SignUpAdmin);

//Sign-out APIs
app.MapPost(
    "/api/logout",
    (HttpContext ctx) =>
    {
        ctx.Response.Cookies.Delete(
            ".AspNetCore.Session",
            new CookieOptions
            {
                Path = "/",
                Secure = ctx.Request.IsHttps,
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
            }
        );
        return Results.Ok(new { success = true });
    }
);

//Password Reset APIs
app.MapPost("/api/password/reset/{resetToken}", EmployeeRoutes.ResetPasswordWithLink);
app.MapPut("/api/ResetPassword/{testuserId}", EmployeeRoutes.SendResetLink);
app.MapGet("/api/employee/{userId}/check-password", EmployeeRoutes.CheckDefaultPassword);
app.MapGet("/api/password/validate-token/{resetToken}", EmployeeRoutes.ValidateResetToken);

app.Run();
